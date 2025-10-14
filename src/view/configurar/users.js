import React from "react";
import { NavBar } from "../../components/navbar"
import { isEmpty, PriceFormat } from "../../shared/utils";
import { addUser, getUsers, updateUser, deleteUser } from "../../store/collections/userWorker";
import { getServices } from "../../store/collections/servicesWorker";
import { getEstabelecimento } from "../../config/auth";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            establishment: getEstabelecimento(),
            newUserStatus: "active",
            newUserIsProvider: true,
            newUserNome: "",
            newUserCelular: "",
            newUserEmail: "",
            newUserSenha: "",
            users : [],
            newUserServices: [],

            newUserNomeAlert: "",
            newUserCelularAlert: "",
            newUserEmailAlert: "",
            newUserSenhaAlert: "",

            editingUserModalOpen: false,
            editingUser: null,
            editingUserServices: [],
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        const users = await getUsers(this.state.establishment.id)
        this.setState({ users: users })
        const services = await getServices(this.state.establishment.id)
        this.setState({ services: services })
    }

    handleNewUser = async () => {
        try {
            console.log('Iniciando cadastro de usuário...')
            const data = {
                status: this.state.newUserStatus,
                isProvider: this.state.newUserIsProvider,
                nome: this.state.newUserNome,
                celular: this.state.newUserCelular,
                email: this.state.newUserEmail,
                senha: this.state.newUserSenha,
                services: this.state.newUserServices || [],
                establishmentId: this.state.establishment.id
            }
            console.log('Dados do usuário:', data)
            
            if (this.verifyFields(data)) {
                console.log('Validação passou, salvando...')
                const result = await addUser(data)
                console.log('Resultado do salvamento:', result)
                alert("Usuário cadastrado com sucesso!")
                this.load()
                this.cleanFields()
            } else {
                console.log('Validação falhou')
            }
        } catch (error) {
            console.error("Erro ao cadastrar usuário:", error)
            alert("Erro ao cadastrar usuário: " + error.message)
        }
    }

    cleanFields = () => {
        this.setState({ newUserStatus: "active", newUserNome: "", newUserCelular: "", newUserEmail: "", newUserSenha: "", newUserServices: [] })
    }

    verifyFields = (data, checkEmailAndPassword = true) => {
        var isValid = true
        var invalidAlert = ""
        if (isEmpty(data.nome)) {
            invalidAlert = isEmpty(invalidAlert) ? "Informe o nome" : invalidAlert
            this.setState({ newUserNomeAlert: "is-invalid" })
            isValid = false
        }
        if (isEmpty(data.celular)) {
            invalidAlert = isEmpty(invalidAlert) ? "Informe o celular" : invalidAlert
            this.setState({ newUserCelularAlert: "is-invalid" })
            isValid = false
        }
        if (isEmpty(data.email) && checkEmailAndPassword) {
            invalidAlert = isEmpty(invalidAlert) ? "Informe o email" : invalidAlert
            this.setState({ newUserEmailAlert: "is-invalid" })
            isValid = false
        }
        if (isEmpty(data.senha) && checkEmailAndPassword) {
            invalidAlert = isEmpty(invalidAlert) ? "Informe a senha" : invalidAlert
            this.setState({ newUserSenhaAlert: "is-invalid" })
            isValid = false
        }
        if (!isValid) {
            alert(invalidAlert)
        }
        return isValid
    }

    showEditingUserModal = (user) => {
        return () => {
            this.setState({
                editingUserModalOpen: true,
                editingUser: {...user}
            })
        }
    }

    hideEditingUserModal = () => {
        this.setState({ editingUserModalOpen: false, editingUser: null })
    }

    handleEditUser = async () => {
        const data = {
            id: this.state.editingUser.id,
            isProvider: this.state.editingUser.isProvider ?? "false",
            status: this.state.editingUser.status,
            nome: this.state.editingUser.nome,
            celular: this.state.editingUser.celular,
            services: this.state.editingUser.services ?? [],
        }
        if (this.verifyFields(data, false)) {
            try {
                await updateUser(data)
                this.load()
                this.cleanFields()
                this.hideEditingUserModal()
            } catch (error) {
                console.error("Erro ao editar o usuário:", error.message)
            }
        }
    }

    handleDeleteUser = async (data) => {
        const result = await deleteUser(data)
        if (result) {
            alert("Serviço excluído com sucesso!")
            this.load()
        }
    }

    handleServiceSelected = (item) => {
        var services = this.state.newUserServices || []
        const isServiceSelected = services.some(service => service.id === item.id)
        if (isServiceSelected) {
            services.splice(services.findIndex(service => service.id === item.id), 1)
        } else {
            services.push(item)
        }
        this.setState({ newUserServices: services })
    }

    handleServiceSelectedOnEdit = (item) => {
        var editingUser = { ...this.state.editingUser }
        var services = editingUser.services || []
        const isServiceSelected = services.some(service => service.id === item.id)
        if (isServiceSelected) {
            services.splice(services.findIndex(service => service.id === item.id), 1)
        } else {
            services.push(item)
        }
        editingUser.services = services
        this.setState({ editingUser })
    }

    verifyServiceOnEdit = (item) => {
        return this.state.editingUser?.services?.some(e => e.id === item.id)
    }


    render() {
        return (
            <>
                <NavBar />
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-4 mb-4">
                            <div className="card p-3 shadow-lg bg-white rounded">
                                <h2>Cadastrar usuário</h2>
                                    <div>
                                        <label>Status</label>
                                        <select name="status" id="status" className="form-control" onChange={(e) => this.setState({ newUserStatus: e.target.value })}>
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                        </select>
                                        <label>Permitir agendamentos</label>
                                        <select name="isProvider" id="isProvider" className="form-control" onChange={(e) => this.setState({ newUserIsProvider: e.target.value })}>
                                            <option value="true">Sim</option>
                                            <option value="false">Não</option>
                                        </select>
                                        <label>Nome</label>
                                        <input type="text" name="nome" id="nome" placeholder="Nome do serviço" className={`form-control ${this.state.newUserNomeAlert}`}
                                            value={this.state.newUserNome} onChange={(e) => this.setState({ newUserNome: e.target.value, newUserNomeAlert: "" })} />
                                        <label>Celular</label>
                                        <input type="text" name="celular" id="celular" placeholder="Celular" className={`form-control ${this.state.newUserCelularAlert}`}
                                            value={this.state.newUserCelular} onChange={(e) => this.setState({ newUserCelular: e.target.value, newUserCelularAlert: "" })} />
                                        <label>Email</label>
                                        <input type="text" name="email" id="email" placeholder="Email" className={`form-control ${this.state.newUserEmailAlert}`}
                                            value={this.state.newUserEmail} onChange={(e) => this.setState({ newUserEmail: e.target.value, newUserEmailAlert: "" })} />
                                        <label>Senha</label>
                                        <input type="password" name="senha" id="senha" placeholder="Senha" className={`form-control ${this.state.newUserSenhaAlert}`}
                                            value={this.state.newUserSenha} onChange={(e) => this.setState({ newUserSenha: e.target.value, newUserSenhaAlert: "" })} />
                                    </div>
                                    {
                                        this.state.newUserIsProvider === true && this.state.services?.length > 0 &&
                                        <div className="mt-3">
                                            {
                                                this.state.services.map((service, index) => {
                                                    return (
                                                        <div className="d-flex d-flex justify-content-between mb-2">
                                                            <div className="me-1 text-nowrap">{service.nome} - <PriceFormat value={service.preco} /></div>
                                                            <div className="form-check form-switch">
                                                                <input className="form-check-input" type="checkbox" id="servicos" onChange={() => this.handleServiceSelected(service)}/>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    }
                                <button className="btn btn-primary mt-3" onClick={this.handleNewUser}>Cadastrar</button>
                            </div>
                        </div>
                        <div className="col-12 col-md-8 mb-4">
                            <div className="card p-4 shadow-lg bg-white rounded mb-3">
                                <h2>Usuários cadastrados</h2>
                                {
                                    this.state.users.length > 0 &&
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="text-start col-md-3">Status</th>
                                                <th scope="col" className="text-start col-md-3">Nome</th>
                                                <th scope="col" className="text-start col-md-4">email</th>
                                                <th scope="col" className="text-start col-md-2">celular</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.users.map((user, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td className="text-start">
                                                                {
                                                                    user.status === "active" ?
                                                                    <span className="badge bg-success me-2">Ativo</span> :
                                                                    <span className="badge bg-danger">Inativo</span>
                                                                }
                                                                {
                                                                    user.isProvider === "true" && user.status === "active" &&
                                                                    <span className="badge bg-success">Agendavel</span>
                                                                }
                                                            </td>
                                                            <td className="text-start">{user.nome}</td>
                                                            <td className="text-start">{user.email}</td>
                                                            <td className="text-start">{user.celular}</td>
                                                            <td className="align-middle">
                                                                <div className="d-flex flex-nowrap gap-2 justify-content-end">
                                                                    <button className="btn btn-secondary" onClick={this.showEditingUserModal(user)}>
                                                                        <i className="fas fa-edit" />
                                                                    </button>
                                                                    <button className="btn btn-danger" onClick={() => this.handleDeleteUser(user)}>
                                                                        <i className="fas fa-trash" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            }
                                        </tbody>
                                    </table>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <Dialog onClose={this.hideEditingUserModal} fullWidth maxWidth={"xs"} open={this.state.editingUserModalOpen}>
                    {
                        this.state.editingUserModalOpen &&
                        <DialogContent>
                            <div className="card p-4 shadow-lg bg-white rounded">
                                <h2>Editar usuário</h2>
                                <div>
                                    <label>Status</label>
                                    <select name="status" id="status" className="form-control" value={this.state.editingUser.status}
                                        onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, status: e.target.value }})}>
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                    </select>
                                    <label>Permitir agendamentos</label>
                                    <select name="isProvider" id="isProvider" className="form-control" value={this.state.editingUser.isProvider ?? "false"}
                                        onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, isProvider: e.target.value }})}>
                                        <option value={"true"}>Sim</option>
                                        <option value={"false"}>Não</option>
                                    </select>
                                    <label>Nome</label>
                                    <input type="text" name="nome" id="nome" placeholder="Nome do serviço" className={`form-control ${this.state.newUserNomeAlert}`}
                                        value={this.state.editingUser.nome} onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, nome: e.target.value } })} />
                                    <label>Celular</label>
                                    <input type="text" name="celular" id="celular" placeholder="Celular" className={`form-control ${this.state.newUserCelularAlert}`}
                                        value={this.state.editingUser.celular} onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, celular: e.target.value } })} />
                                    <label>Email</label>
                                    <input type="text" name="email" id="email" placeholder="Email" className={`form-control`} value={this.state.editingUser.email} disabled/>
                                </div>
                                <div>
                                    {
                                        this.state.newUserIsProvider === true && this.state.services?.length > 0 &&
                                        <div className="mt-3">
                                            {
                                                this.state.services.map((service, index) => {
                                                    return (
                                                        <div className="d-flex d-flex justify-content-between mb-2">
                                                            <div className="me-1 text-nowrap">{service.nome} - <PriceFormat value={service.preco} /></div>
                                                            <div className="form-check form-switch">
                                                                <input className="form-check-input" type="checkbox" id="servicos" checked={this.verifyServiceOnEdit(service)} onChange={() => this.handleServiceSelectedOnEdit(service)}/>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    }
                                </div>
                                <button className="btn btn-primary mt-3" onClick={this.handleEditUser}>Editar</button>
                            </div>
                        </DialogContent>
                    }
                </Dialog>
            </>
        )
    }
}

export { Users }