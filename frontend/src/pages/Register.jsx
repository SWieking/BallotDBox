import RegisterFrom from "../components/RegisterForm"
import Header from "../components/Header"


function Register() {
    return(
        <div>
            <Header type={'register'}></Header>
            <RegisterFrom/>
        </div>
    )
    
}

export default Register