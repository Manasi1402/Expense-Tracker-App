const Expense = require('../models/expenses');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');

const addexpense = (req, res) => {
    const { expenseamount, description, category } = req.body;
    req.user.createExpense({ expenseamount, description, category }).then(expense => {
        return res.status(201).json({expense, success: true } );
    }).catch(err => {
        return res.status(403).json({success : false, error: err})
    })
}

const getexpenses = (req, res) => {
    const page = parseInt(req.query.page) || 1;   
    const limit = parseInt(req.query.limit) || 10; 

    const offset = (page - 1) * limit;

    req.user.getExpenses({
        offset,
        limit,
        order: [['createdAt', 'DESC']]
    })
    .then(expenses => {
        return res.status(200).json({ expenses, success: true, currentPage: page });
    })
    .catch(err => {
        return res.status(402).json({ error: err, success: false });
    });
}


const deleteexpense = (req, res) => {
    const expenseid = req.params.expenseid;
    Expense.destroy({where: { id: expenseid }}).then(() => {
        return res.status(204).json({ success: true, message: "Deleted Successfuly"})
    }).catch(err => {
        console.log(err);
        return res.status(403).json({ success: true, message: "Failed"})
    })
}

const downloadExpenses =  async (req, res) => {

    try {
        if(!req.user.ispremiumuser){
            return res.status(401).json({ success: false, message: 'User is not a premium User'})
        }
        const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; 
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

      

        const containerName = 'akashkumar91655@gmail.com'; 

        console.log('\nCreating container...');
        console.log('\t', containerName);

       
        const containerClient = await blobServiceClient.getContainerClient(containerName);

        
        if(!containerClient.exists()){
            
            const createContainerResponse = await containerClient.create({ access: 'container'});
            console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);
        }
        
        const blobName = 'expenses' + uuidv1() + '.txt';

        
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        console.log('\nUploading to Azure storage as blob:\n\t', blobName);

        
        const data =  JSON.stringify(await req.user.getExpenses());

        const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
        console.log("Blob was uploaded successfully. requestId: ", JSON.stringify(uploadBlobResponse));

      
        const fileUrl = `https://demostoragesharpener.blob.core.windows.net/${containerName}/${blobName}`;
        res.status(201).json({ fileUrl, success: true}); 
    } catch(err) {
        res.status(500).json({ error: err, success: false, message: 'Something went wrong'})
    }

};

module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadExpenses
}