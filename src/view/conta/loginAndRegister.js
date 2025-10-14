import React from "react";
import { isValidPhoneNumber, PhoneNumberInput } from "../../shared/utils";
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../config/firebase'
import { addEstablishment } from '../../store/collections/registerWorker'
import { addUser } from '../../store/collections/userWorker'
import { checkUser, handleLogin } from "../../config/auth";
import { isEmpty, removeSimbols, isValidDocument } from "../../shared/utils";

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            error: null,
            isLoading: true
        }
    }

    componentDidMount() {
        checkUser();
    }
    render() {
        return (
            <> 
                {
                    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
                        <div className="card shadow-lg border-0" style={{ 
                            borderRadius: 'var(--radius-xl)', 
                            maxWidth: '400px', 
                            width: '100%',
                            background: 'var(--bg-primary)'
                        }}>
                            <div className="card-body p-5">
                                <div className="text-center mb-4">
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto var(--spacing-lg)',
                                        color: 'white',
                                        fontSize: 'var(--font-size-2xl)',
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        P
                                    </div>
                                    <h1 style={{ 
                                        fontSize: 'var(--font-size-3xl)', 
                                        fontWeight: 'var(--font-weight-bold)', 
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        Bem-vindo de volta!
                                    </h1>
                                    <p style={{ 
                                        color: 'var(--text-secondary)', 
                                        fontSize: 'var(--font-size-base)',
                                        marginBottom: 'var(--spacing-xl)'
                                    }}>
                                        PratiCorte - Gestão rápida e fácil da sua barbearia
                                    </p>
                                </div>
                                
                                <form>
                                    <div className="mb-4">
                                        <label className="form-label" htmlFor="email" style={{ 
                                            fontWeight: 'var(--font-weight-medium)',
                                            color: 'var(--text-primary)',
                                            marginBottom: 'var(--spacing-sm)'
                                        }}>
                                            E-mail
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="fas fa-envelope" style={{
                                                position: 'absolute',
                                                left: 'var(--spacing-md)',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-tertiary)',
                                                zIndex: 1
                                            }}></i>
                                            <input className="form-control" 
                                                   type="email" 
                                                   name="email" 
                                                   id="email" 
                                                   placeholder="exemplo@gmail.com"
                                                   style={{ paddingLeft: '2.5rem' }}
                                                   onChange={(e) => this.setState({ email: e.target.value })}/>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="form-label" htmlFor="password" style={{ 
                                            fontWeight: 'var(--font-weight-medium)',
                                            color: 'var(--text-primary)',
                                            marginBottom: 'var(--spacing-sm)'
                                        }}>
                                            Senha
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="fas fa-lock" style={{
                                                position: 'absolute',
                                                left: 'var(--spacing-md)',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-tertiary)',
                                                zIndex: 1
                                            }}></i>
                                            <input className="form-control" 
                                                   type="password" 
                                                   name="password" 
                                                   id="password" 
                                                   placeholder="••••••••"
                                                   style={{ paddingLeft: '2.5rem' }}
                                                   onChange={(e) => this.setState({ password: e.target.value })}/>
                                        </div>
                                    </div>
                                </form>
                                
                                <div className="text-center mb-4">
                                    <Link to="/" style={{ 
                                        color: 'var(--primary-color)', 
                                        textDecoration: 'none',
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-medium)'
                                    }}>
                                        Esqueceu sua senha?
                                    </Link>
                                </div>
                                
                                <button className="btn btn-primary w-100 mb-4" 
                                        style={{ 
                                            padding: 'var(--spacing-md)',
                                            fontSize: 'var(--font-size-base)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                        onClick={() => handleLogin(this.state.email, this.state.password, (isLoading) => this.setState({ isLoading }))}>
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Entrar
                                </button>
                                
                                <div className="text-center">
                                    <p style={{ 
                                        color: 'var(--text-secondary)', 
                                        fontSize: 'var(--font-size-sm)',
                                        marginBottom: 'var(--spacing-md)'
                                    }}>
                                        Ainda não é cliente?
                                    </p>
                                    <Link to="/criar-conta">
                                        <button className="btn btn-outline-primary w-100" style={{
                                            padding: 'var(--spacing-md)',
                                            fontSize: 'var(--font-size-base)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <i className="fas fa-user-plus me-2"></i>
                                            Criar conta
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }
}

class Register extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
            email: "",
            password: "",
            phoneNumber: "",
            establishment: "",
            error: null,
        } 
    }

    componentDidMount() {
        checkUser();
    }

    verifyFields = (data) => {
        if (isEmpty(data.email)) {
            alert("E-mail não informado")
            return false
        }
        if (isEmpty(data.name)) {
            alert("Nome não informado")
            return false
        }
        if (isEmpty(data.password)) {
            alert("Senha não informada")
            return false
        }
        if (!isValidDocument(data.document)) {
            alert("Informe um CPF ou CNPJ no documento válido")
            return false
        }
        if (!isValidPhoneNumber(data.phoneNumber)) {
            alert("Informe um celular válido")
            return false
        }
        if (isEmpty(data.establishment)) {
            alert("Nome do estabelecimento não informado")
            return false
        }
        return true
    }

    handleRegister = async () => {
        const data = {
            email: this.state.email,
            password: this.state.password,
            phoneNumber: removeSimbols(this.state.phoneNumber),
            establishment: this.state.establishment,
            name: this.state.name,
            document: this.state.document,
        }
        if (this.verifyFields(data)) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
                const establishmentData = {
                    email: data.email,
                    nomeEstabelecimento: data.establishment,
                    nomeResponsavel: data.name,
                    celular: data.phoneNumber,
                }
                const establishmentCreated = await addEstablishment(establishmentData)
                const userData = {
                    email: data.email,
                    nomeEstabelecimento: data.establishment,
                    nome: data.name,
                    celular: data.phoneNumber,
                    estabelecimentoId: establishmentCreated.id,
                }
                await addUser(userData)
                handleLogin(data.email, data.password, (isLoading) => this.setState({ isLoading }));
            } catch (error) {
                if (error.message === "Firebase: Error (auth/email-already-in-use).") {
                    alert("E-mail já cadastrado")
                }
                console.error("Erro no cadastro:", error.message)
                if (error.message === "Firebase: Error (auth/invalid-email).") {
                    alert("E-mail inválido")
                }
                this.setState({ error: error.message })
            }
        }
    }

    render() {
        return (
            <>
                <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
                    <div className="card shadow-lg border-0" style={{ 
                        borderRadius: 'var(--radius-xl)', 
                        maxWidth: '500px', 
                        width: '100%',
                        background: 'var(--bg-primary)'
                    }}>
                        <div className="card-body p-5">
                            <div className="text-center mb-4">
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto var(--spacing-lg)',
                                    color: 'white',
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: 'var(--font-weight-bold)'
                                }}>
                                    P
                                </div>
                                <h1 style={{ 
                                    fontSize: 'var(--font-size-3xl)', 
                                    fontWeight: 'var(--font-weight-bold)', 
                                    color: 'var(--text-primary)',
                                    marginBottom: 'var(--spacing-sm)'
                                }}>
                                    Crie sua conta!
                                </h1>
                                <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    fontSize: 'var(--font-size-base)',
                                    marginBottom: 'var(--spacing-xl)'
                                }}>
                                    PratiCorte - Gestão rápida e fácil da sua barbearia
                                </p>
                            </div>
                            
                            <form>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label" htmlFor="email" style={{ 
                                            fontWeight: 'var(--font-weight-medium)',
                                            color: 'var(--text-primary)',
                                            marginBottom: 'var(--spacing-sm)'
                                        }}>
                                            E-mail
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="fas fa-envelope" style={{
                                                position: 'absolute',
                                                left: 'var(--spacing-md)',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-tertiary)',
                                                zIndex: 1
                                            }}></i>
                                            <input className="form-control" 
                                                   type="email" 
                                                   name="email" 
                                                   id="email" 
                                                   placeholder="exemplo@gmail.com"
                                                   style={{ paddingLeft: '2.5rem' }}
                                                   onChange={(e) => this.setState({ email: e.target.value })}/>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label" htmlFor="name" style={{ 
                                            fontWeight: 'var(--font-weight-medium)',
                                            color: 'var(--text-primary)',
                                            marginBottom: 'var(--spacing-sm)'
                                        }}>
                                            Nome do responsável
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <i className="fas fa-user" style={{
                                                position: 'absolute',
                                                left: 'var(--spacing-md)',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--text-tertiary)',
                                                zIndex: 1
                                            }}></i>
                                            <input className="form-control" 
                                                   type="text" 
                                                   name="name" 
                                                   id="name" 
                                                   placeholder="Seu nome completo"
                                                   style={{ paddingLeft: '2.5rem' }}
                                                   onChange={(e) => this.setState({ name: e.target.value })}/>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="password" style={{ 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        Senha
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <i className="fas fa-lock" style={{
                                            position: 'absolute',
                                            left: 'var(--spacing-md)',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-tertiary)',
                                            zIndex: 1
                                        }}></i>
                                        <input className="form-control" 
                                               type="password" 
                                               name="password" 
                                               id="password" 
                                               placeholder="••••••••"
                                               style={{ paddingLeft: '2.5rem' }}
                                               onChange={(e) => this.setState({ password: e.target.value })}/>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="document" style={{ 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        <Link to="https://www.4devs.com.br/gerador_de_cpf" target="_blank" style={{ 
                                            color: 'var(--primary-color)', 
                                            textDecoration: 'none' 
                                        }}>
                                            Documento (CPF ou CNPJ)
                                        </Link>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <i className="fas fa-id-card" style={{
                                            position: 'absolute',
                                            left: 'var(--spacing-md)',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-tertiary)',
                                            zIndex: 1
                                        }}></i>
                                        <input className="form-control" 
                                               type="text" 
                                               name="document" 
                                               id="document" 
                                               placeholder="000.000.000-00"
                                               style={{ paddingLeft: '2.5rem' }}
                                               onChange={(e) => this.setState({ document: e.target.value })}/>
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="phoneNumber" style={{ 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        Celular
                                    </label>
                                    <PhoneNumberInput value={this.state.phoneNumber} onChange={(e) => this.setState({ phoneNumber: e.target.value })} />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label" htmlFor="establishment" style={{ 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        Nome do Estabelecimento
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <i className="fas fa-building" style={{
                                            position: 'absolute',
                                            left: 'var(--spacing-md)',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-tertiary)',
                                            zIndex: 1
                                        }}></i>
                                        <input className="form-control" 
                                               type="text" 
                                               name="establishment" 
                                               id="establishment" 
                                               placeholder="Barbearia PratiCorte"
                                               style={{ paddingLeft: '2.5rem' }}
                                               onChange={(e) => this.setState({ establishment: e.target.value })} />
                                    </div>
                                </div>
                            </form>
                            
                            <div className="text-center mb-4">
                                <Link to="/termos-de-uso" target="_blank" style={{ 
                                    color: 'var(--text-secondary)', 
                                    textDecoration: 'none',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    Ao criar uma conta, você concorda com nossos <strong>termos de uso</strong> e <strong>política de privacidade</strong>.
                                </Link>
                            </div>
                            
                            <button className="btn btn-primary w-100 mb-4" 
                                    style={{ 
                                        padding: 'var(--spacing-md)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        borderRadius: 'var(--radius-md)'
                                    }}
                                    onClick={this.handleRegister}>
                                <i className="fas fa-user-plus me-2"></i>
                                Criar conta
                            </button>
                            
                            <div className="text-center">
                                <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    fontSize: 'var(--font-size-sm)',
                                    marginBottom: 'var(--spacing-md)'
                                }}>
                                    Já é cliente?
                                </p>
                                <Link to="/">
                                    <button className="btn btn-outline-primary w-100" style={{
                                        padding: 'var(--spacing-md)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <i className="fas fa-sign-in-alt me-2"></i>
                                        Acesse sua conta
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}



export { Login, Register }