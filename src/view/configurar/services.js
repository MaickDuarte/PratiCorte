import React from "react";
import { NavBar } from "../../components/navbar"
import { TimeInput, isEmpty, convertTimeToMinutes, OrderByField, saveTime, PriceFormat } from "../../shared/utils";
import CurrencyInput from "../../components/CurrencyInput";
import { addService, getServices, deleteService, updateService } from "../../store/collections/servicesWorker";
import { getEstabelecimento } from "../../config/auth";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

class Services extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            establishment: getEstabelecimento(),
            newServiceStatus: "Ativo",
            newServiceNome: "",
            newServiceDescricao: "",
            newServicePreco: "",
            newServiceDuracao: "",
            services: [],

            newServiceNomeAlert: "",
            newServiceDescricaoAlert: "",
            newServicePrecoAlert: "",
            newServiceDuracaoAlert: "",

            editingServiceModalOpen: false,
            editingService: null,
        }
    }

    componentDidMount() {
        this.load()
    }

    handleNewService = async () => {
        try {
            console.log('Iniciando cadastro de serviço...')
            const data = {
                status: this.state.newServiceStatus,
                nome: this.state.newServiceNome,
                descricao: this.state.newServiceDescricao,
                preco: this.state.newServicePreco,
                duracao: saveTime(this.state.newServiceDuracao),
                establishmentId: this.state.establishment.id
            }
            console.log('Dados do serviço:', data)
            
            if (this.verifyFields(data)) {
                console.log('Validação passou, salvando...')
                const result = await addService(data)
                console.log('Resultado do salvamento:', result)
                alert("Serviço cadastrado com sucesso!")
                this.load()
                this.cleanFields()
            } else {
                console.log('Validação falhou')
            }
        } catch (error) {
            console.error("Erro ao cadastrar serviço:", error)
            alert("Erro ao cadastrar serviço: " + error.message)
        }
    }

    cleanFields = () => {
        this.setState({ newServiceStatus: "Ativo", newServiceNome: "", newServiceDescricao: "", newServicePreco: "", newServiceDuracao: "" })
    }

    verifyFields = (data) => {
        var isValid = true
        var invalidAlert = ""
        if (isEmpty(data.nome)) {
            invalidAlert = isEmpty(invalidAlert) ? "Nome do serviço não informado" : invalidAlert
            this.setState({ newServiceNomeAlert: "is-invalid" })
            isValid = false
        }
        if (isEmpty(data.preco) || parseInt(data.preco) <= 0) {
            invalidAlert = isEmpty(invalidAlert) ? "Preço do serviço não informado" : invalidAlert
            this.setState({ newServicePrecoAlert: "is-invalid" })
            isValid = false
        }
        if (data.duracao.length < 4 || !data.duracao) {
            invalidAlert = isEmpty(invalidAlert) ? "Duração do serviço inválida" : invalidAlert
            this.setState({ newServiceDuracaoAlert: "is-invalid" })
            isValid = false
        }
        if (!isValid) {
            alert(invalidAlert)
        }
        return isValid
    }

    load = async () => {
        const services = await getServices(this.state.establishment.id)
        const ordered = OrderByField(services, "nome")
        this.setState({ services: ordered })
    }

    handleDeleteService = async (data) => {
        const result = await deleteService(data)
        if (result) {
            alert("Serviço excluído com sucesso!")
            this.load()
        }
    }


    showEditingServiceModal = (service) => {
        return () => {
            const serviceWithFormattedTime = {
                ...service,
                duracao: saveTime(service.duracao)
            }
            this.setState({
                editingServiceModalOpen: true,
                editingService: serviceWithFormattedTime
            })
        }
    }

    hideEditingServiceModal = () => {
        this.setState({ editingServiceModalOpen: false, editingService: null })
    }

    handleEditService = async () => {
        const data = {
            id: this.state.editingService.id,
            status: this.state.editingService.status,
            nome: this.state.editingService.nome,
            descricao: this.state.editingService.descricao,
            preco: this.state.editingService.preco,
            duracao: saveTime(this.state.editingService.duracao),
        }
        if (this.verifyFields(data)) {
            try {
                await updateService(data)
                this.load()
                this.cleanFields()
                this.hideEditingServiceModal()
            } catch (error) {
                console.error("Erro ao editar serviço:", error.message)
            }
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
                                <h2>Cadastrar serviços</h2>
                                <label>Status</label>
                                <select name="status" id="status" className="form-control" onChange={(e) => this.setState({ newServiceStatus: e.target.value })}>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                                <label>Nome do serviço</label>
                                <input type="text" name="nome" id="nome" placeholder="Nome do serviço" className={`form-control ${this.state.newServiceNomeAlert}`}
                                    value={this.state.newServiceNome} onChange={(e) => this.setState({ newServiceNome: e.target.value, newServiceNomeAlert: "" })} />
                                <label>Descrição</label>
                                <textarea name="descricao" id="descricao" placeholder="Descrição" className={`form-control ${this.state.newServiceDescricaoAlert}`} rows="4"
                                    value={this.state.newServiceDescricao} onChange={(e) => this.setState({ newServiceDescricao: e.target.value, newServiceDescricaoAlert: "" })} />
                                <label>Preço</label>
                                <CurrencyInput prefix="R$" value={this.state.newServicePreco} className={`form-control ${this.state.newServicePrecoAlert}`}
                                    onChangeEvent={(event, maskedvalue, value) => { this.setState({ newServicePreco: value, newServicePrecoAlert: "" }) }} />
                                <label>Duração</label>
                                <TimeInput value={this.state.newServiceDuracao} className={this.state.newServiceDuracaoAlert}
                                    onChange={(e) => this.setState({ newServiceDuracao: e.target.value, newServiceDuracaoAlert: "" })} />
                                <button className="btn btn-primary mt-3" onClick={this.handleNewService}>Cadastrar</button>
                            </div>
                        </div>
                        <div className="col-12 col-md-8 mb-4">
                            <div className="card p-4 shadow-lg bg-white rounded mb-3">
                                <h2>Serviços cadastrados</h2>
                                {
                                    this.state.services.length > 0 &&
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="col-md-3">Nome</th>
                                                <th scope="col" className="d-none d-md-table-cell col-md-4">Descrição</th>
                                                <th scope="col" className="text-center col-md-2">Preço</th>
                                                <th scope="col" className="text-center col-md-2">Duração</th>
                                                <th scope="col" className="text-center col-md-2">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.services.map((service, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{service.nome}</td>
                                                            <td className="d-none d-md-table-cell">{service.descricao}</td>
                                                            <td className="text-center"><PriceFormat value={service.preco} /></td>
                                                            <td className="text-center">{service.duracao}</td>
                                                            <td className="align-middle">
                                                                <div className="d-flex flex-nowrap gap-2 justify-content-center">
                                                                    <button className="btn btn-secondary" onClick={this.showEditingServiceModal(service)}>
                                                                        <i className="fas fa-edit" />
                                                                    </button>
                                                                    <button className="btn btn-danger" onClick={() => this.handleDeleteService(service)}>
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
                <Dialog onClose={this.hideEditingServiceModal} fullWidth maxWidth={"xs"} open={this.state.editingServiceModalOpen}>
                    {
                        this.state.editingServiceModalOpen &&
                        <DialogContent>
                            <div className="card p-4 shadow-lg bg-white rounded">
                                <h2>Editar serviço</h2>
                                <label>Status</label>
                                <select name="status" id="status" className="form-control"
                                    value={this.state.editingService.status}
                                    onChange={(e) => this.setState({ editingService: { ...this.state.editingService, status: e.target.value } })}>
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                                <label>Nome do serviço</label>
                                <input type="text" name="nome" id="nome" placeholder="Nome do serviço" className={`form-control ${this.state.newServiceNomeAlert}`}
                                    value={this.state.editingService.nome}
                                    onChange={(e) => this.setState({ editingService: { ...this.state.editingService, nome: e.target.value } })} />
                                <label>Descrição</label>
                                <textarea name="descricao" id="descricao" placeholder="Descrição" className={`form-control ${this.state.newServiceDescricaoAlert}`} rows="4"
                                    value={this.state.editingService.descricao}
                                    onChange={(e) => this.setState({ editingService: { ...this.state.editingService, descricao: e.target.value } })} />
                                <label>Preço</label>
                                <CurrencyInput prefix="R$" value={this.state.editingService.preco} className={`form-control ${this.state.newServicePrecoAlert}`}
                                    onChangeEvent={(event, maskedvalue, value) => { this.setState({ editingService: { ...this.state.editingService, preco: value } }) }} />
                                <label>Duração</label>
                                <TimeInput value={this.state.editingService.duracao} className={this.state.newServiceDuracaoAlert}
                                    onChange={(e) => this.setState({ editingService: { ...this.state.editingService, duracao: e.target.value } })} />
                                <button className="btn btn-primary mt-3" onClick={this.handleEditService}>Editar</button>
                            </div>
                        </DialogContent>
                    }
                </Dialog>
            </>
        )
    }
}

export { Services }