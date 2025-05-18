import React from "react";
import { NavBar } from "../../components/navbar"
import { getEstabelecimento}  from "../../config/auth";
import { isEmpty, PhoneNumberFormat, PhoneNumberInput, removeSimbols } from "../../shared/utils";
import { updateEstablishment } from "../../store/collections/establishmentWorker";

class Establishment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            establishment: null,
            isEditing: false,
            isEditingNomeEstabelecimento: "",
            isEditingNomeResponsavel: "",
            isEditingEmail: "",
            isEditingCelular: "",
            isEditingEndereco: "",
        }
    }

    componentDidMount() {
        const establishment = getEstabelecimento()
        this.setState({
            establishment: establishment,
            isEditingEmail: establishment?.email ?? "",
            isEditingNomeEstabelecimento: establishment?.nomeEstabelecimento ?? "",
            isEditingNomeResponsavel: establishment?.nomeResponsavel ?? "",
            isEditingCelular: establishment?.celular ?? "",
            isEditingEndereco: establishment?.endereco ?? "",
        })
    }

    save = async () => {
        const data = {
            id: this.state.establishment?.id,
            email: this.state.isEditingEmail,
            nomeEstabelecimento: this.state.isEditingNomeEstabelecimento,
            nomeResponsavel: this.state.isEditingNomeResponsavel,
            celular: removeSimbols(this.state.isEditingCelular),
            endereco: this.state.isEditingEndereco,
        }
        if (this.verifyFields(data)) {
            try {
                if (await updateEstablishment(data)){
                    this.setState({ isEditing: false, establishment: data })
                } else {
                    alert("Erro ao atualizar o estabelecimento")
                }
            } catch (error) {
                console.error("Erro ao atualizar o estabelecimento:", error.message)
            }
        }
    }

    verifyFields = (data) => {
        if (isEmpty(data.email)) {
            alert("E-mail não informado")
            return false
        }
        if (isEmpty(data.nomeEstabelecimento)) {
            alert("Nome do estabelecimento não informado")
            return false
        }
        if (isEmpty(data.nomeResponsavel)) {
            alert("Nome do responsável não informado")
            return false
        }
        if (isEmpty(data.celular)) {
            alert("Celular não informado")
            return false
        } 
        if (data.celular.length < 10) {
            alert("Celular inválido")
            return false
        }
        if (isEmpty(data.endereco)) {
            alert("Endereço não informado")
            return false
        }
        return true
    }

    render() {
        return (
            <>
                <NavBar />
                <div className="container d-flex flex-column justify-content-center align-items-center">
                    <div className="card p-4 shadow-lg bg-white rounded">
                        <div className="mb-2">
                            <h1>Dados do seu estabelecimento</h1>  
                        </div>
                        {
                            this.state.isEditing == false ? (
                                <div className="mb-3">
                                    <div> Nome do estabelecimento: {!isEmpty(this.state.establishment?.nomeEstabelecimento) ? this.state.establishment?.nomeEstabelecimento :"Não informado"}</div>
                                    <div> Nome do responsável: {!isEmpty(this.state.establishment?.nomeResponsavel) ? this.state.establishment?.nomeResponsavel : "Não informado"}</div>
                                    <div> E-mail: {!isEmpty(this.state.establishment?.email) ? this.state.establishment?.email : "Não informado"}</div>
                                    <div> Celular: {!isEmpty(this.state.establishment?.celular) ? (<PhoneNumberFormat value={this.state.establishment.celular} />) : ("Não informado")}</div>
                                    <div> Endereço: {!isEmpty(this.state.establishment?.endereco) ?  this.state.establishment?.endereco : "Não informado"}</div>
                                </div>
                            ) : (
                                <div className="mb-3">
                                    <form>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="nomeEstabelecimento">Nome do estabelecimento</label>
                                            <input className="form-control" type="text" name="nomeEstabelecimento" id="nomeEstabelecimento" placeholder="Nome do estabelecimento"
                                            value={this.state.isEditingNomeEstabelecimento}
                                            onChange={(e) => this.setState({ isEditingNomeEstabelecimento: e.target.value })}/>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="nomeEstabelecimento">Nome do responsável</label>
                                            <input className="form-control" type="text" name="nomeEstabelecimento" id="nomeEstabelecimento" placeholder="Nome do responsável"
                                            value={this.state.isEditingNomeResponsavel}
                                            onChange={(e) => this.setState({ isEditingNomeResponsavel: e.target.value })}/>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="email">E-mail</label>
                                            <input className="form-control" type="text" name="email" id="email" placeholder="exemplo@gmail.com"
                                            value={this.state.isEditingEmail}
                                            onChange={(e) => this.setState({ isEditingEmail: e.target.value })}/>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="celular">Celular</label>
                                            <PhoneNumberInput value={this.state.isEditingCelular} onChange={(e) => this.setState({ isEditingCelular: e.target.value })} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="endereco">Endereço</label>
                                            <input className="form-control" type="text" name="endereco" id="endereco" placeholder="Endereço"
                                            value={this.state.isEditingEndereco}
                                            onChange={(e) => this.setState({ isEditingEndereco: e.target.value })}/>
                                        </div>
                                    </form>
                                </div>
                            )   
                        }
                        <div>
                            <button className="btn btn-primary  me-2" onClick={() => this.setState({ isEditing: !this.state.isEditing })}>
                                {this.state.isEditing ? "Cancelar" : "Editar"}
                            </button>
                            {
                                this.state.isEditing && (
                                    <button className="btn btn-success" onClick={this.save}>
                                        Salvar
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export { Establishment }