import react from 'react';
import { getEstabelecimento, getSessao } from '../../config/auth';
import { isEmpty, PhoneNumberFormat, dateToString, PriceFormat, PhoneNumberInput, removeSimbols, hoursArrayToString } from '../../shared/utils';
import { setAvailableHours } from '../../services/appointment/appointmentService';
import { addAppointment, updateAppointment } from '../../store/collections/appointmentWorker';
import { hourStillAvailable, verifyServiceTimeInBlocks } from '../../services/appointment/appointmentService';

class Appointment extends react.Component {
    constructor(props) {
        super(props);
        console.log(props.appoitmentData)
        this.state = {
            sessao: getSessao(),
            editingAppointment: props.appoitmentData?.appointment || null,
            providers: props.appoitmentData?.providers || [],
            horarios: props.appoitmentData?.horarios || [],
            appointmentTitle: '',
            appoitmentSubTitle:'',
            appointmentsStep: props.appoitmentData?.mininumStep || 1,
            mininumStep: props.appoitmentData?.mininumStep || 1,
            establishment: getEstabelecimento(),
            availableHours: [],
            providers: [],
            appointments: [],
            selectedProvider:  props.appoitmentData?.providers[0] || null,
            selectedDay: null,
            selectedHour: [],
            originalHourSelected: props.appoitmentData?.originalHourSelected || [],
            selectedService: null,
            appointmentCliente:  props.appoitmentData?.appointment?.cliente?.nome || "",
            appointmentCelular: props.appoitmentData?.appointment?.cliente?.celular || "",
            appointmentObservation: props.appoitmentData?.appointment?.cliente?.observacao || "",
            appointmentTitle: 'Realize um agendamento'
        }
    }

    componentDidMount() {
        this.setState({ 
            providers: this.props.appoitmentData.providers,
            appointmentTitle: this.props.appoitmentData.appointmentTitle,
            horarios: this.props.appoitmentData.horarios
        })
    }

    handleSelectedProvider = (provider) => {
        this.setState({ selectedProvider: provider })
        this.handleNextStep()
    }

    handleSelectedDay = async (day) => {
        this.setState({ selectedDay: day, isloading: true });
        try {
            await this.setAvailableHours(day)
            this.handleNextStep()
        } catch (error) {
            alert("Erro ao buscar horários disponíveis:", error)
        } finally {
            this.setState({ isloading: false })
        }
    }

    setAvailableHours = async (day) => {
        const availableHours = await setAvailableHours(this.state.selectedProvider.id, day, this.state.originalHourSelected)
        this.setState({ availableHours: availableHours })
    }

    handleSelectedHour = async (hour) => {
        this.setState({ isloading: true })
        const availableHours = await setAvailableHours(this.state.selectedProvider.id, this.state.selectedDay, this.state.originalHourSelected)
        if (!await hourStillAvailable(availableHours, [hour])) {
            this.setAvailableHours(this.state.selectedDay)
            this.setState({ isloading: false })
            return alert("Horário não está mais disponível, selecione outro horário.");
        }
        this.setState({ 
            selectedHour: [hour],
            isloading: true
         }, () => {
            this.handleNextStep()
        })
    }

    handleServiceSelected = async (service) => {
        var blocks = verifyServiceTimeInBlocks(service)
        if (blocks > 1) {
            this.setState({ isloading: true })
            var availableHours = await setAvailableHours(this.state.selectedProvider.id, this.state.selectedDay, this.state.originalHourSelected);
            var startCheck = availableHours.findIndex(item => item.hour === this.state.selectedHour?.[0])
            var endCheck = startCheck + blocks
            var newSelectedHours = []
            for (var i = startCheck; i < endCheck; i++){
                if (availableHours[i]?.available !== true && !availableHours[i]?.isEditing) {
                    alert(`Esse serviço leva ${blocks} horarios e o horario das ${availableHours[i]?.hour} está indisponivel`)
                    this.setState({ isloading: false })
                    return
                } else {
                    newSelectedHours.push(availableHours[i].hour)
                }
            }
            this.setState({ selectedHour: newSelectedHours })
        }
        this.setState({ 
            selectedService: service,
            isloading: true
        }, () => {
            this.handleNextStep()
        })
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
            this.setState({ 
                appointmentTitle: 'Realize um agendamento',
                appoitmentSubTitle: '',
                selectedProvider: null
            })
        }
        if (this.state.appointmentsStep === 2) {
            this.setState({ 
                appointmentTitle: 'Selecione uma data', 
                appoitmentSubTitle: '',
                selectedDay: null 
            })
        }
        if (this.state.appointmentsStep === 3) {
            this.setState({ 
                appointmentTitle: 'Selecione um horário',
                appoitmentSubTitle: this.state.selectedDay.dia,
                selectedHour: null 
            })
        }
        if (this.state.appointmentsStep === 4) {
            this.setState({ 
                appointmentTitle: 'Selecione um serviço',
                appoitmentSubTitle: `${this.state.selectedDay.dia} - ${this.state.selectedHour}`,
                selectedService: null
            })
        }
        if (this.state.appointmentsStep === 5) {
            this.setState({
                appointmentTitle: 'Resumo do Agendamento',
                appoitmentSubTitle: ''
            })
        }
        this.setState({ isloading: false })
    }

     finishAppointment = async () => {
        const data = {
            provider: this.state.selectedProvider,
            dateInfo: {
                date: this.state.selectedDay.date,
                hour: this.state.selectedHour,
                indexDayOfWeek:this.state.selectedDay.dayOfWeek,
                titleDayOfWeek: this.state.selectedDay.dia,
                selectedDay: this.state.selectedDay
            },
            service: this.state.selectedService,
            establishment: this.state.establishment,
            establishmentId: this.state.establishment.id,
            cliente: {
                nome: this.state.appointmentCliente ?? "",
                celular: removeSimbols(this.state.appointmentCelular) ?? "",
                observacao: this.state.appointmentObservation ?? ""
            },
        }
        this.setState({ isloading: true });
        const availableHours = await setAvailableHours(this.state.selectedProvider.id, this.state.selectedDay, this.state.originalHourSelected)
        if (!await hourStillAvailable(availableHours, this.state.selectedHour)) {
            this.setState({ isloading: false })
            return alert("Horário não está mais disponível, selecione outro horário.");
        }
        if (this.verifyFields(data) && this.verifyAppointmentStillAvailable) {
            try {
                await addAppointment(data)
                alert("Agendamento feito com sucesso!")
                this.cleanFields()
            } catch (error) {
                console.error("Erro ao realizar agendamento:", error.message)
            }
            this.props.reload(data)
        }
        this.setState({ appointmentsStep: 1, selectedProvider: null }, () => {
            this.handleStepTitle()
        })
        console.log("Agendamento finalizado com sucesso!")
    }

    updateAppointment = async () => {
        console.log("Atualizar Agendamento")
        console.log(this.state.editingAppointment)
        const data = {
            id: this.state.editingAppointment.id,
            oldAppointment: this.state.editingAppointment,
            dateInfo: {
                date: this.state.selectedDay.date,
                hour: this.state.selectedHour,
                indexDayOfWeek:this.state.selectedDay.dayOfWeek,
                titleDayOfWeek: this.state.selectedDay.dia,
                selectedDay: this.state.selectedDay
            },
            service: this.state.selectedService,
            cliente: {
                nome: this.state.appointmentCliente ?? "",
                celular: removeSimbols(this.state.appointmentCelular) ?? "",
                observacao: this.state.appointmentObservation ?? ""
            },
        }
        this.setState({ isloading: true });
        const availableHours = await setAvailableHours(this.state.selectedProvider.id, this.state.selectedDay, this.state.originalHourSelected)
        if (!await hourStillAvailable(availableHours, this.state.selectedHour)) {
            this.setState({ isloading: false })
            return alert("Horário não está mais disponível, selecione outro horário.");
        }
        if (this.verifyFields(data) && this.verifyAppointmentStillAvailable) {
            try {
                await updateAppointment(data)
                alert("Agendamento atualizado com sucesso!")
                this.cleanFields()
            } catch (error) {
                console.error("Erro ao atualizar agendamento:", error.message)
            }
            this.props.hideEditingAppointment()
            this.props.reload(data)
        }
        console.log("Agendamento atualizado com sucesso!")
    }

    verifyAppointmentStillAvailable = () => {

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
                <div className="card shadow-lg border-0" style={{ 
                    borderRadius: 'var(--radius-xl)', 
                    maxWidth: '600px', 
                    width: '100%',
                    background: 'var(--bg-primary)'
                }}>
                    <div className="card-header" style={{ 
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                        color: 'var(--text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                    }}>
                        <h4 className="mb-2 text-center" style={{ 
                            fontSize: 'var(--font-size-xl)', 
                            fontWeight: 'var(--font-weight-bold)',
                            margin: 0
                        }}>
                            {this.state.appointmentTitle}
                        </h4>
                        {this.state.appoitmentSubTitle && (
                            <p className="text-center mb-0" style={{ 
                                fontSize: 'var(--font-size-sm)',
                                opacity: 0.9
                            }}>
                                {this.state.appoitmentSubTitle}
                            </p>
                        )}
                    </div>
                    
                    <div className="card-body p-4">
                        <div className="d-flex flex-column gap-3">
                        {
                            this.state.isloading && (
                                    <div className="d-flex justify-content-center py-4">
                                        <div className="spinner" style={{ width: '32px', height: '32px' }}></div>
                                </div>
                            )
                        }
                        {
                            this.state.appointmentsStep === 1 && !this.state.isloading && this.state.providers.map((provider, index) => {
                                //Realize um agendamento
                                return (
                                    <button key={index} 
                                            className="btn btn-outline-primary text-start d-flex align-items-center p-3" 
                                            onClick={() => this.handleSelectedProvider(provider)}
                                            style={{
                                                borderRadius: 'var(--radius-lg)',
                                                border: '2px solid var(--primary-color)',
                                                background: 'transparent',
                                                color: 'var(--primary-color)',
                                                transition: 'all var(--transition-fast)',
                                                textAlign: 'left'
                                            }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: 'var(--primary-color)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 'var(--spacing-md)',
                                            color: 'white',
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: 'var(--font-weight-bold)'
                                        }}>
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-1" style={{ 
                                                fontSize: 'var(--font-size-lg)', 
                                                fontWeight: 'var(--font-weight-semibold)',
                                                margin: 0
                                            }}>
                                                {provider?.nome}
                                            </h6>
                                            <div style={{ 
                                                fontSize: 'var(--font-size-sm)', 
                                                color: 'var(--text-secondary)',
                                                opacity: 0.8
                                            }}>
                                                <i className="fas fa-phone me-1"></i>
                                                {!isEmpty(provider?.celular) ? (<PhoneNumberFormat value={provider?.celular} />) : ("Não informado")}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })
                        }
                        {
                            this.state.appointmentsStep === 2 && !this.state.isloading && this.state.horarios.map((day, index) => {
                                //Selecione uma data
                                if (day.isDayAllowed === false) {
                                    return (
                                        <button key={index} 
                                                className="btn btn-outline-secondary text-start d-flex align-items-center p-3" 
                                                disabled
                                                style={{
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: '2px solid var(--neutral-300)',
                                                    background: 'var(--neutral-100)',
                                                    color: 'var(--text-tertiary)',
                                                    opacity: 0.6
                                                }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                background: 'var(--neutral-300)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 'var(--spacing-md)',
                                                color: 'var(--text-tertiary)',
                                                fontSize: 'var(--font-size-lg)'
                                            }}>
                                                <i className="fas fa-calendar-times"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-1" style={{ 
                                                    fontSize: 'var(--font-size-lg)', 
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    margin: 0
                                                }}>
                                                    {day.dia}
                                                </h6>
                                                <div style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    color: 'var(--text-tertiary)'
                                                }}>
                                                    {dateToString(day.date)}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                }
                                return (
                                    <button key={index} 
                                            className="btn btn-outline-primary text-start d-flex align-items-center p-3" 
                                            onClick={() => this.handleSelectedDay(day)}
                                            style={{
                                                borderRadius: 'var(--radius-lg)',
                                                border: '2px solid var(--primary-color)',
                                                background: 'transparent',
                                                color: 'var(--primary-color)',
                                                transition: 'all var(--transition-fast)',
                                                textAlign: 'left'
                                            }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: 'var(--primary-color)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 'var(--spacing-md)',
                                            color: 'white',
                                            fontSize: 'var(--font-size-lg)'
                                        }}>
                                            <i className="fas fa-calendar-check"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-1" style={{ 
                                                fontSize: 'var(--font-size-lg)', 
                                                fontWeight: 'var(--font-weight-semibold)',
                                                margin: 0
                                            }}>
                                                {day.dia}
                                            </h6>
                                            <div style={{ 
                                                fontSize: 'var(--font-size-sm)', 
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {dateToString(day.date)}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })
                        }
                        {
                            this.state.appointmentsStep === 3 && !this.state.isloading && (this.state.availableHours?.length > 0 ? (
                                //Selecione um horário
                                <div className="row g-2">
                                    {this.state.availableHours.map((hour, index) => {
                                    if (!hour.available && !hour.isEditing) {
                                        return (
                                                <div key={index} className="col-6 col-md-4">
                                                    <button className="btn btn-outline-secondary w-100 p-3" disabled
                                                            style={{
                                                                borderRadius: 'var(--radius-lg)',
                                                                border: '2px solid var(--neutral-300)',
                                                                background: 'var(--neutral-100)',
                                                                color: 'var(--text-tertiary)',
                                                                opacity: 0.6
                                                            }}>
                                                        <div style={{ 
                                                            fontSize: 'var(--font-size-lg)', 
                                                            fontWeight: 'var(--font-weight-semibold)'
                                                        }}>
                                                            <i className="fas fa-clock me-2"></i>
                                                            {hour.hour}
                                                        </div>
                                            </button>
                                                </div>
                                        )
                                        } else if (hour.isEditing) {
                                        return (
                                                <div key={index} className="col-6 col-md-4">
                                                    <button className="btn btn-outline-warning w-100 p-3" 
                                                            onClick={() => this.handleSelectedHour(hour.hour)}
                                                            style={{
                                                                borderRadius: 'var(--radius-lg)',
                                                                border: '2px solid var(--warning-color)',
                                                                background: 'transparent',
                                                                color: 'var(--warning-color)',
                                                                transition: 'all var(--transition-fast)'
                                                            }}>
                                                        <div style={{ 
                                                            fontSize: 'var(--font-size-lg)', 
                                                            fontWeight: 'var(--font-weight-semibold)'
                                                        }}>
                                                            <i className="fas fa-edit me-2"></i>
                                                            {hour.hour}
                                                        </div>
                                            </button>
                                                </div>
                                        )
                                    } else{
                                            const isSelected = this.state.selectedHour && this.state.selectedHour.includes(hour.hour)
                                        return (
                                                <div key={index} className="col-6 col-md-4">
                                                    <button className={`btn w-100 p-3 ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                                            onClick={() => this.handleSelectedHour(hour.hour)}
                                                            style={{
                                                                borderRadius: 'var(--radius-lg)',
                                                                border: isSelected ? 'none' : '2px solid var(--primary-color)',
                                                                background: isSelected ? 'var(--primary-color)' : 'transparent',
                                                                color: isSelected ? 'var(--text-inverse)' : 'var(--primary-color)',
                                                                transition: 'all var(--transition-fast)',
                                                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                                                boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                                                            }}>
                                                        <div style={{ 
                                                            fontSize: 'var(--font-size-lg)', 
                                                            fontWeight: 'var(--font-weight-semibold)'
                                                        }}>
                                                            <i className={`fas ${isSelected ? 'fa-check-circle' : 'fa-clock'} me-2`}></i>
                                                            {hour.hour}
                                                        </div>
                                            </button>
                                                </div>
                                            ) 
                                        }
                                    })}
                                </div>
                            ) : (
                                <div className="alert alert-warning d-flex align-items-center" role="alert" style={{
                                    borderRadius: 'var(--radius-lg)',
                                    border: 'none',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: 'var(--warning-color)',
                                    padding: 'var(--spacing-lg)'
                                }}>
                                    <i className="fas fa-exclamation-triangle me-3" style={{ fontSize: 'var(--font-size-xl)' }}></i>
                                    <div>
                                        <strong>Nenhum horário disponível</strong><br/>
                                        <small>Nenhum horário configurado para este dia da semana.</small>
                                    </div>
                                </div>
                            ))
                        }
                        {
                            this.state.appointmentsStep === 4 && !this.state.isloading && (!isEmpty(this.state.selectedProvider?.services) ? (
                                //Selecione um serviço
                                this.state.selectedProvider.services.map((service, index) => {
                                    return (
                                        <button key={index} 
                                                className="btn btn-outline-primary text-start d-flex align-items-center p-3" 
                                                onClick={() => this.handleServiceSelected(service)}
                                                style={{
                                                    borderRadius: 'var(--radius-lg)',
                                                    border: '2px solid var(--primary-color)',
                                                    background: 'transparent',
                                                    color: 'var(--primary-color)',
                                                    transition: 'all var(--transition-fast)',
                                                    textAlign: 'left'
                                                }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                background: 'var(--primary-color)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginRight: 'var(--spacing-md)',
                                                color: 'white',
                                                fontSize: 'var(--font-size-lg)'
                                            }}>
                                                <i className="fas fa-cut"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-1" style={{ 
                                                    fontSize: 'var(--font-size-lg)', 
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    margin: 0
                                                }}>
                                                    {service.nome}
                                                </h6>
                                                <div style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: 'var(--spacing-xs)'
                                                }}>
                                                    <i className="fas fa-dollar-sign me-1"></i>
                                                    <PriceFormat value={service.preco} />
                                                </div>
                                                <div style={{ 
                                                    fontSize: 'var(--font-size-sm)', 
                                                    color: 'var(--text-tertiary)'
                                                }}>
                                                    <i className="fas fa-clock me-1"></i>
                                                    Duração: {service.duracao}
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="alert alert-warning d-flex align-items-center" role="alert" style={{
                                    borderRadius: 'var(--radius-lg)',
                                    border: 'none',
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    color: 'var(--warning-color)',
                                    padding: 'var(--spacing-lg)'
                                }}>
                                    <i className="fas fa-exclamation-triangle me-3" style={{ fontSize: 'var(--font-size-xl)' }}></i>
                                    <div>
                                        <strong>Nenhum serviço disponível</strong><br/>
                                        <small>{this.state.selectedProvider ? "Nenhum serviço disponível para este prestador." : "Selecione um prestador primeiro."}</small>
                                    </div>
                                </div>
                            ))
                        }
                        {
                            this.state.appointmentsStep === 5 && !this.state.isloading &&
                            //Resumo do Agendamento
                            <div>
                                <div className="card border-0 shadow-sm p-4" style={{ 
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    <h5 className="mb-3" style={{ 
                                        fontSize: 'var(--font-size-lg)', 
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <i className="fas fa-calendar-check me-2" style={{ color: 'var(--primary-color)' }}></i>
                                        Resumo do Agendamento
                                    </h5>
                                    
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-user me-3" style={{ color: 'var(--primary-color)', width: '20px' }}></i>
                                                <div>
                                                    <small style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Prestador</small>
                                                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{this.state.selectedProvider?.nome}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-calendar me-3" style={{ color: 'var(--primary-color)', width: '20px' }}></i>
                                                <div>
                                                    <small style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Data</small>
                                                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                                        {this.state.selectedDay ? `${this.state.selectedDay.dia} - ${dateToString(this.state.selectedDay.date)}` : "Não selecionada"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-clock me-3" style={{ color: 'var(--primary-color)', width: '20px' }}></i>
                                                <div>
                                                    <small style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Horário</small>
                                                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{hoursArrayToString(this.state.selectedHour)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-cut me-3" style={{ color: 'var(--primary-color)', width: '20px' }}></i>
                                                <div>
                                                    <small style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Serviço</small>
                                                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                                        {this.state.selectedService?.nome || "Não selecionado"} - <PriceFormat value={this.state.selectedService?.preco} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card border-0 shadow-sm p-4 mt-3" style={{ 
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-secondary)'
                                }}>
                                    <h5 className="mb-3" style={{ 
                                        fontSize: 'var(--font-size-lg)', 
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <i className="fas fa-user me-2" style={{ color: 'var(--primary-color)' }}></i>
                                        Dados do Cliente
                                    </h5>
                                    
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label" style={{ 
                                                fontWeight: 'var(--font-weight-medium)',
                                                color: 'var(--text-primary)',
                                                marginBottom: 'var(--spacing-sm)'
                                            }}>
                                                Nome do Cliente
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
                                                <input type="text" 
                                                       name="nome" 
                                                       id="nome" 
                                                       placeholder="Nome completo do cliente" 
                                                       className="form-control"
                                                       style={{ paddingLeft: '2.5rem' }}
                                                       value={this.state.appointmentCliente} 
                                                       onChange={(e) => this.setState({ appointmentCliente: e.target.value })} />
                                            </div>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label" style={{ 
                                                fontWeight: 'var(--font-weight-medium)',
                                                color: 'var(--text-primary)',
                                                marginBottom: 'var(--spacing-sm)'
                                            }}>
                                                Celular
                                            </label>
                                            <PhoneNumberInput 
                                                value={this.state.appointmentCelular} 
                                                onChange={(e) => this.setState({ appointmentCelular: e.target.value })} 
                                            />
                                        </div>
                                        
                                        <div className="col-12">
                                            <label className="form-label" style={{ 
                                                fontWeight: 'var(--font-weight-medium)',
                                                color: 'var(--text-primary)',
                                                marginBottom: 'var(--spacing-sm)'
                                            }}>
                                                Observações
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <i className="fas fa-comment" style={{
                                                    position: 'absolute',
                                                    left: 'var(--spacing-md)',
                                                    top: 'var(--spacing-md)',
                                                    color: 'var(--text-tertiary)',
                                                    zIndex: 1
                                                }}></i>
                                                <textarea name="observação" 
                                                          id="observação" 
                                                          placeholder="Observações sobre o atendimento (opcional)" 
                                                          className="form-control"
                                                          style={{ paddingLeft: '2.5rem', minHeight: '80px' }}
                                                          value={this.state.appointmentObservation} 
                                                          onChange={(e) => this.setState({ appointmentObservation: e.target.value })} />
                                            </div>
                                        </div>
                                </div>
                                </div>
                                {
                                    this.state.mininumStep === 1 &&
                                    <button className="btn btn-success btn-lg w-100" 
                                            onClick={() => this.finishAppointment()}
                                            style={{
                                                padding: 'var(--spacing-lg)',
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                borderRadius: 'var(--radius-lg)'
                                            }}>
                                        <i className="fas fa-check-circle me-2"></i>
                                        Finalizar Agendamento
                                    </button>
                                }
                                {
                                    this.state.mininumStep === 2 &&
                                    <button className="btn btn-primary btn-lg w-100" 
                                            onClick={() => this.updateAppointment()}
                                            style={{
                                                padding: 'var(--spacing-lg)',
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                borderRadius: 'var(--radius-lg)'
                                            }}>
                                        <i className="fas fa-save me-2"></i>
                                        Atualizar Agendamento
                                    </button>
                                }
                            </div>
                        }
                    </div>
                    {
                        this.state.appointmentsStep > this.state.mininumStep  &&
                        <div className="d-flex justify-content-start mt-3">
                            <button className="btn btn-outline-secondary" 
                                    onClick={this.handleLastStep}
                                    style={{
                                        padding: 'var(--spacing-md) var(--spacing-lg)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                <i className="fas fa-arrow-left me-2"></i>
                                Voltar
                            </button>
                        </div>
                    }
                    </div>
                </div>
            </div>
        )
    }
}

export { Appointment };