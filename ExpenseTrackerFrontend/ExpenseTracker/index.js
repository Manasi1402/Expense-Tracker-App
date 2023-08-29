const token = localStorage.getItem('token');
let currentPage = 1;
const itemsPerPage = 5;

function addNewExpense(e) {
    e.preventDefault();
    const form = new FormData(e.target);

    const expenseDetails = {
        expenseamount: form.get("expenseamount"),
        description: form.get("description"),
        category: form.get("category")
    };

    axios.post('http://localhost:3000/user/addexpense', expenseDetails, { headers: { "Authorization": token } })
        .then((response) => {
            if (response.status === 201) {
                addNewExpensetoUI(response.data.expense);
            } else {
                throw new Error('Failed To create new expense');
            }
        })
        .catch(err => showError(err));
}

function updateExpensesUI() {
    const parentElement = document.getElementById('listOfExpenses');
    parentElement.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    axios.get(`http://localhost:3000/user/getexpenses?page=${currentPage}&itemsPerPage=${itemsPerPage}`, { headers: { "Authorization": token } })
        .then(response => {
            if (response.status === 200) {
                const expenses = response.data.expenses;
                expenses.forEach(expense => {
                    addNewExpensetoUI(expense);
                });
            } else {
                throw new Error();
            }
        });
}

window.addEventListener('load', () => {
    updateExpensesUI();
});

document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        updateExpensesUI();
    }
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    currentPage++;
    updateExpensesUI();
});

function addNewExpensetoUI(expense) {
    const parentElement = document.getElementById('listOfExpenses');
    const expenseElemId = `expense-${expense.id}`;
    parentElement.innerHTML += `
        <li id=${expenseElemId}>
            ${expense.expenseamount} - ${expense.category} - ${expense.description}
            <button onclick='deleteExpense(event, ${expense.id})'>
                Delete Expense
            </button>
        </li>`;
}

function deleteExpense(e, expenseid) {
    axios.delete(`http://localhost:3000/user/deleteexpense/${expenseid}`, { headers: { "Authorization": token } })
        .then((response) => {
            if (response.status === 204) {
                removeExpensefromUI(expenseid);
            } else {
                throw new Error('Failed to delete');
            }
        })
        .catch(err => showError(err));
}

function showError(err) {
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`;
}

function removeExpensefromUI(expenseid) {
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

function download() {
    axios.get('http://localhost:3000/user/download', { headers: { "Authorization": token } })
        .then((response) => {
            if (response.status === 201) {
                var a = document.createElement("a");
                a.href = response.data.fileUrl;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message);
            }
        })
        .catch((err) => {
            showError(err);
        });
}

document.getElementById('rzp-button1').onclick = async function (e) {
    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });
    console.log(response);
    var options = {
        "key": response.data.key_id,
        "name": "AK Technology",
        "order_id": response.data.order.id,
        "prefill": {
            "name": "Akash Kumar",
            "email": "akashkumar91655@gmail.com",
            "contact": "8521068143"
        },
        "theme": {
            "color": "#3399cc"
        },
        "handler": function (response) {
            console.log(response);
            axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: { "Authorization": token } })
                .then(() => {
                    alert('You are a Premium User Now');
                })
                .catch(() => {
                    alert('Something went wrong. Try Again!!!');
                });
        },
    };
    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
    });
};
