import React from "react";
import { NavBar } from "../../components/navbar"
import { isEmpty } from "../../shared/utils";
import { addUser, getUsers, updateUser, deleteUser } from "../../store/collections/userWorker";
import { getEstabelecimento } from "../../config/auth";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

class Users extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            establishment: getEstabelecimento(),
            newUserStatus: "Ativo",
            newUserAgendavel: true,
            newUserNome: "",
            newUserCelular: "",
            newUserEmail: "",
            newUserSenha: "",
            users : [],

            newUserNomeAlert: "",
            newUserCelularAlert: "",
            newUserEmailAlert: "",
            newUserSenhaAlert: "",

            editingUserModalOpen: false,
            editingUser: null,
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        console.log(this.state.users)
        const users = await getUsers(this.state.establishment.id)
        console.log(users)
        this.setState({ users: users })
    }

    handleNewUser = async () => {
        const data = {
            status: this.state.newUserStatus,
            agendavel: this.state.newUserAgendavel,
            nome: this.state.newUserNome,
            celular: this.state.newUserCelular,
            email: this.state.newUserEmail,
            senha: this.state.newUserSenha,
        }
        if (this.verifyFields(data)) {
            try {
                await addUser(data)
                alert("Usuário cadastrado com sucesso!")
                this.load()
                this.cleanFields()
            } catch (error) {
                console.error("Erro ao cadastrar serviço:", error.message)
            }
        }
    }

    cleanFields = () => {
        this.setState({ newUserStatus: "Ativo", newUserNome: "", newUserCelular: "", newUserEmail: "", newUserSenha: "" })
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
            agendavel: this.state.editingUser.agendavel,
            status: this.state.editingUser.status,
            nome: this.state.editingUser.nome,
            celular: this.state.editingUser.celular,
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

    render() {
        return (
            <>
                <NavBar />
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-4 mb-4">
                            <div className="card p-3 shadow-lg bg-white rounded">
                                <h2>Cadastrar usuário</h2>
                                <label>Status</label>
                                <select name="status" id="status" className="form-control" onChange={(e) => this.setState({ newUserStatus: e.target.value })}>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
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
                                <label>Status</label>
                                <select name="status" id="status" className="form-control" value={this.state.editingUser.status}
                                    onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, status: e.target.value }})}>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                                <label>Tipo</label>
                                <select name="agendavel" id="agendavel" className="form-control" value={this.state.editingUser.agendavel}
                                    onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, agendavel: e.target.value }})}>
                                    <option value={true}>Barbeiro</option>
                                    <option value={false}>Administrativo</option>
                                </select>
                                <label>Nome</label>
                                <input type="text" name="nome" id="nome" placeholder="Nome do serviço" className={`form-control ${this.state.newUserNomeAlert}`}
                                    value={this.state.editingUser.nome} onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, nome: e.target.value } })} />
                                <label>Celular</label>
                                <input type="text" name="celular" id="celular" placeholder="Celular" className={`form-control ${this.state.newUserCelularAlert}`}
                                    value={this.state.editingUser.celular} onChange={(e) => this.setState({ editingUser: { ...this.state.editingUser, celular: e.target.value } })} />
                                <label>Email</label>
                                <input type="text" name="email" id="email" placeholder="Email" className={`form-control`} value={this.state.editingUser.email} disabled/>
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