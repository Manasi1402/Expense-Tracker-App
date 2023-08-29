

document.addEventListener('submit',loginUser);
const email=document.getElementById('email');
const password=document.getElementById('password');
function loginUser(event){
    console.log('in event');
    event.preventDefault();
    axios.post('http://localhost:3000/user/login',{email:email.value,password:password.value})
    .then((res)=>{
        const para=document.getElementById('para');
        console.log(res.data.message);
        para.innerText=res.data.message;
        if(res.data.message!="Password does'nt match"&& res.data.message!="User does'nt exist"){
            localStorage.setItem('token',res.data.token);
            localStorage.setItem('premium',res.data.premium);
            window.location.href='../ExpenseTracker.html';


        }
        
    })
    .catch(err=>console.log(err));


}
document.getElementById('forgot').addEventListener('click',forgot);
function forgot(){
    window.location.href='forgot.html';

}