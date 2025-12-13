import React from "react";
import { NavBar } from "../../components/navbar"
import { getEstabelecimento}  from "../../config/auth";
import { isEmpty, isValidPhoneNumber, PhoneNumberFormat, PhoneNumberInput, removeSimbols, isValidDocument, DocumentFormat } from "../../shared/utils";
import { updateEstablishment } from "../../store/collections/establishmentWorker";
import { setEstabelecimento } from "../../config/auth";
import { QRCodeCanvas } from "qrcode.react";

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
            isEditingDocumento: "",
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
            isEditingDocumento: establishment?.documento ?? "",
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
            documento: removeSimbols(this.state.isEditingDocumento),
        }
        if (this.verifyFields(data)) {
            try {
                if (await updateEstablishment(data)){
                    this.setState({ isEditing: false, establishment: data })
                    setEstabelecimento(data)
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
        if (!isValidPhoneNumber(data.celular)) {
            alert("Informe um celular válido")
            return false
        } 
        if (!isValidDocument(data.documento)) {
            alert("Informe um CPF ou CNPJ no documento válido")
            return false
        }
        if (isEmpty(data.endereco)) {
            alert("Endereço não informado")
            return false
        }
        return true
    }

    downloadQRCode = () => {
        const canvas = document.getElementById("qrcode-public-link")
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = "qrcode-agendamento.png"
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
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
                            this.state.isEditing === false ? (
                                <div className="mb-3">
                                    <div> Nome do estabelecimento: {!isEmpty(this.state.establishment?.nomeEstabelecimento) ? this.state.establishment?.nomeEstabelecimento :"Não informado"}</div>
                                    <div> Nome do responsável: {!isEmpty(this.state.establishment?.nomeResponsavel) ? this.state.establishment?.nomeResponsavel : "Não informado"}</div>
                                    <div> E-mail: {!isEmpty(this.state.establishment?.email) ? this.state.establishment?.email : "Não informado"}</div>
                                    <div> Celular: {!isEmpty(this.state.establishment?.celular) ? (<PhoneNumberFormat value={this.state.establishment?.celular} />) : ("Não informado")}</div>
                                    <div> Endereço: {!isEmpty(this.state.establishment?.endereco) ? this.state.establishment?.endereco : ("Não informado")}</div>
                                    <div> Documento: {!isEmpty(this.state.establishment?.documento) ? (<DocumentFormat value={this.state.establishment?.documento} />) : "Não informado"}</div>
                                    <div> Link para agendamento público: <a href={`/estabelecimento/${this.state.establishment?.id}/marcar`} target="_blank" rel="noreferrer">{`${window.location.origin}/estabelecimento/${this.state.establishment?.id}/marcar`}</a></div>
                                    <div className="d-flex align-items-center gap-4 mt-3">
                                        <QRCodeCanvas
                                            id="qrcode-public-link"
                                            value={`${window.location.origin}/estabelecimento/${this.state.establishment?.id}/marcar`}
                                            size={150}
                                            level="H"
                                        />
                                        <button className="btn btn-outline-primary" onClick={this.downloadQRCode}>
                                            Baixar QR Code para agendamentos.
                                        </button>
                                    </div>
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
                                        <div className="mb-3">
                                            <label className="form-label" htmlFor="document">Documento</label>
                                            <input className="form-control" type="text" name="document" id="document" placeholder="CPF ou CPNJ"
                                            value={this.state.isEditingDocumento}
                                            onChange={(e) => this.setState({ isEditingDocumento: e.target.value })}/>
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