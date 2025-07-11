import react from 'react';
import { getEstabelecimento, getSessao } from '../../config/auth';
import { isEmpty, PhoneNumberFormat, completeAvailableHours, dateToString, PriceFormat, PhoneNumberInput, removeSimbols } from '../../shared/utils';
import { getActiveUsersAppointmentAllowed } from '../../store/collections/userWorker';
import { getDay } from "date-fns";
import { addAppointment, getAppointmentByProviderAndDate } from '../../store/collections/appointmentWorker';

class Appointment extends react.Component {
    constructor(props) {
        super(props);
        this.state = {
            sessao: getSessao(),
            appointmentTitle: '',
            appointmentsStep: 1,
            establishment: getEstabelecimento(),
            providers: [],
            appointments: [],
            selectedProvider: null,
            selectedDay: null,
            selectedHour: null,
            selectedService: null,
            appointmentCliente: '',
            appointmentCelular: '',
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        const providers = await getActiveUsersAppointmentAllowed(this.state.establishment.id)
        const horarios = this.state.sessao.horarios
        const completedAvailableHours = completeAvailableHours(horarios)
        this.setState({ 
            providers: providers,
            appointmentTitle: 'Realize um agendamento',
            horarios: completedAvailableHours,
        })
    }

    handleSelectedProvider = (provider) => {
        this.setState({ selectedProvider: provider })
        this.handleNextStep()
    }

    handleSelectedDay = async (day) => {
        this.setState({ selectedDay: day })
        var appointmentsByProviderAndDate = await getAppointmentByProviderAndDate(this.state.selectedProvider.id, day.date)
        console.log(appointmentsByProviderAndDate)
        //agora que pegamos todos os agendamentos dos dias, vamos bloquear os horários que já estão ocupados
        this.handleNextStep()
    }

    handleSelectedHour = (hour) => {
        this.setState({ selectedHour: hour })
        this.handleNextStep()
    }

    handleServiceSelected = (service) => {
        this.setState({ selectedService: service })
        this.handleNextStep()
    }

    handleNextStep = () => {
        if (this.state.appointmentsStep <= 5) {
            this.setState({ appointmentsStep: this.state.appointmentsStep + 1 }, () => {
            this.handleStepTitle()
            })
        }
    }

    handleLastStep = () => {
        if (this.state.appointmentsStep > 1) {
            this.setState({ appointmentsStep: this.state.appointmentsStep - 1 }, () => {
            this.handleStepTitle()
            })
        }
    }

    handleStepTitle = () => {
        if (this.state.appointmentsStep === 1) {
            this.setState({ appointmentTitle: 'Realize um agendamento' })
            this.setState({ selectedProvider: null })
        }
        if (this.state.appointmentsStep === 2) {
            this.setState({ appointmentTitle: 'Selecione uma data' })
            this.setState({ selectedDay: null })
        }
        if (this.state.appointmentsStep === 3) {
            this.setState({ appointmentTitle: 'Selecione um horário' })
            this.setState({ selectedHour: null })
        }
        if (this.state.appointmentsStep === 4) {
            this.setState({ appointmentTitle: 'Selecione um serviço' })
            this.setState({ selectedService: null })
        }
        if (this.state.appointmentsStep === 5) {
            this.setState({ appointmentTitle: 'Resumo do Agendamento' })
        }
    }

     finishAppointment = async () => {
        const data = {
            provider: this.state.selectedProvider,
            dateInfo: {
                date: this.state.selectedDay.date,
                hour: this.state.selectedHour,
                indexDayOfWeek:this.state.selectedDay.dayOfWeek,
                titleDayOfWeek: this.state.selectedDay.dia,
            },
            service: this.state.selectedService,
            establishment: this.state.establishment,
            establishmentId: this.state.establishment.id,
            cliente: {
                nome: this.state.appointmentCliente,
                celular: removeSimbols(this.state.appointmentCelular),
                observação: this.state.appointmentObservation,
            }
        }
        if (this.verifyFields(data)) {
            try {
                await addAppointment(data)
                alert("Agendamento feito com sucesso!")
                this.cleanFields()
            } catch (error) {
                console.error("Erro ao realizar agendamento:", error.message)
            }
        }
        this.setState({ appointmentsStep: 1, selectedProvider: null }, () => {
            this.handleStepTitle()
        })
        console.log("Agendamento finalizado com sucesso!")
    }

    verifyFields = (data) => {
        return true
    }

    cleanFields = () => {
        return
    }

    render() {
        return (
            <div className={`d-flex justify-content-center py-5 ${this.state.providers.length > 0 ? 'd-block' : 'd-none'}`}>
                <div className="card p-4 shadow bg-white rounded w-auto">
                    <h5 className="mb-4">{this.state.appointmentTitle}</h5>
                    <div className="d-flex flex-column gap-2" >
                        {
                            this.state.appointmentsStep === 1 && this.state.providers.map((provider, index) => {
                                return (
                                    <button key={index} className="btn btn-outline-primary text-start" onClick={() => this.handleSelectedProvider(provider)}>
                                        <h6 className="mb-1">{provider?.nome}</h6>
                                        <div> Celular: {!isEmpty(provider?.celular) ? (<PhoneNumberFormat value={provider?.celular} />) : ("Não informado")}</div>
                                    </button>
                                )
                            })
                        }
                        {
                            this.state.appointmentsStep === 2 && this.state.horarios.map((day, index) => {
                                if (day.isDayAllowed === false) {
                                    return (
                                        <button key={index} className="btn btn-outline-secondary text-start" disabled>
                                            <h6 className="mb-1">{day.dia} - {dateToString(day.date)}</h6>
                                        </button>
                                    )
                                }
                                return (
                                    <button key={index} className="btn btn-outline-primary text-start" onClick={() => this.handleSelectedDay(day)}>
                                        <h6 className="mb-1">{day.dia} - {dateToString(day.date)}</h6>
                                    </button>
                                )
                            })
                        }
                        {
                            this.state.appointmentsStep === 3 && (this.state.selectedDay.availableHours.length > 0 ? (
                                this.state.selectedDay.availableHours.map((hour, index) => {
                                    return (
                                        <button key={index} className="btn btn-outline-primary text-start" onClick={() => this.handleSelectedHour(hour)}>
                                            <h6 className="mb-1">{hour}</h6>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="alert alert-warning" role="alert">
                                    "Nenhum horário configurado para este dia da semana."
                                </div>
                            ))
                        }
                        {
                        }
                        {
                            this.state.appointmentsStep === 4 && (!isEmpty(this.state.selectedProvider?.services) ? (
                                this.state.selectedProvider.services.map((service, index) => {
                                    return (
                                        <button key={index} className="btn btn-outline-primary text-start" onClick={() => this.handleServiceSelected(service)}>
                                            <h6 className="mb-1">{service.nome} - <PriceFormat value={service.preco}/></h6>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="alert alert-warning" role="alert">
                                    {this.state.selectedProvider ? "Nenhum serviço disponível para este prestador." : "Selecione um prestador primeiro."}
                                </div>
                            ))
                        }
                        {
                            this.state.appointmentsStep === 5 && 
                            <>
                                <div className="card p-3">
                                    <p><strong>Prestador:</strong> {this.state.selectedProvider?.nome}</p>
                                    <p><strong>Data:</strong> {this.state.selectedDay ? `${this.state.selectedDay.dia} - ${dateToString(this.state.selectedDay.date)}` : "Não selecionada"}</p>
                                    <p><strong>Horário:</strong> {this.state.selectedHour || "Não selecionado"}</p>
                                    <p><strong>Serviço:</strong> {this.state.selectedService?.nome || "Não selecionado"} - <PriceFormat value={this.state.selectedService?.preco}/></p>
                                </div>
                                <div className="card p-3">
                                    <label>Cliente Nome</label>
                                    <input type="text" name="nome" id="nome" placeholder="Nome do cliente" className={`form-control`}
                                        value={this.state.appointmentCliente} onChange={(e) => this.setState({ appointmentCliente: e.target.value })} />
                                    <label className="form-label" htmlFor="celular">Cliente Celular</label>
                                        <PhoneNumberInput value={this.state.appointmentCelular} onChange={(e) => this.setState({ appointmentCelular: e.target.value })} />
                                    <label className="form-label" htmlFor="celular">Observação</label>
                                    <textarea name="observação" id="observação" placeholder="Observação" className={`form-control`}
                                        value={this.state.appointmentObservation} onChange={(e) => this.setState({ appointmentObservation: e.target.value })} />
                                </div>
                                <button className="btn btn-success" onClick={this.finishAppointment}>
                                    <h6 className="mb-1">Finalizar</h6>
                                </button>
                            </>
                        }
                    </div>
                    {
                        this.state.appointmentsStep !== 1 &&
                        <div className="d-flex justify-content-start mt-3">
                            <button className="btn btn-primary w-auto" onClick={this.handleLastStep}>
                                Voltar
                            </button>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export { Appointment };