import React from 'react';
import { PhoneNumberInput, dateToString, PriceFormat } from '../shared/utils';
import { addAppointment } from '../store/collections/appointmentWorker';
import { setAvailableHours } from '../services/appointment/appointmentService';

class QuickAppointment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedProvider: null,
            selectedService: null,
            selectedDate: null,
            selectedHour: null,
            clientName: '',
            clientPhone: '',
            clientObservation: '',
            availableHours: [],
            isLoading: false
        }
    }

    componentDidMount() {
        if (this.props.providers && this.props.providers.length > 0) {
            this.setState({ selectedProvider: this.props.providers[0] })
        }
    }

    handleProviderChange = (provider) => {
        this.setState({ 
            selectedProvider: provider,
            selectedService: null,
            selectedDate: null,
            selectedHour: null,
            availableHours: []
        })
    }

    handleServiceChange = (service) => {
        this.setState({ selectedService: service })
    }

    handleDateChange = (date) => {
        this.setState({ 
            selectedDate: date,
            selectedHour: null,
            availableHours: []
        })
        this.loadAvailableHours(date)
    }

    loadAvailableHours = async (date) => {
        if (!this.state.selectedProvider) return
        
        this.setState({ isLoading: true })
        try {
            const hours = await setAvailableHours(this.state.selectedProvider.id, date, [])
            this.setState({ availableHours: hours })
        } catch (error) {
            console.error('Erro ao carregar horários:', error)
        } finally {
            this.setState({ isLoading: false })
        }
    }

    handleHourChange = (hour) => {
        this.setState({ selectedHour: hour })
    }

    handleSubmit = async () => {
        if (!this.state.selectedProvider || !this.state.selectedService || !this.state.selectedDate || !this.state.selectedHour) {
            alert('Preencha todos os campos obrigatórios')
            return
        }

        if (!this.state.clientName.trim()) {
            alert('Nome do cliente é obrigatório')
            return
        }

        try {
            const appointmentData = {
                provider: this.state.selectedProvider,
                dateInfo: {
                    date: this.state.selectedDate.date,
                    hour: [this.state.selectedHour],
                    indexDayOfWeek: this.state.selectedDate.dayOfWeek,
                    titleDayOfWeek: this.state.selectedDate.dia,
                    selectedDay: this.state.selectedDate
                },
                service: this.state.selectedService,
                establishment: this.props.establishment,
                establishmentId: this.props.establishment.id,
                cliente: {
                    nome: this.state.clientName,
                    celular: this.state.clientPhone,
                    observacao: this.state.clientObservation
                }
            }

            await addAppointment(appointmentData)
            alert('Horário marcado com sucesso!')
            this.resetForm()
            if (this.props.onSuccess) {
                this.props.onSuccess()
            }
        } catch (error) {
            console.error('Erro ao marcar horário:', error)
            alert('Erro ao marcar horário. Tente novamente.')
        }
    }

    resetForm = () => {
        this.setState({
            selectedProvider: this.props.providers?.[0] || null,
            selectedService: null,
            selectedDate: null,
            selectedHour: null,
            clientName: '',
            clientPhone: '',
            clientObservation: '',
            availableHours: []
        })
    }

    render() {
        const { providers, horarios, services } = this.props
        
        console.log('QuickAppointment - Dados recebidos:', {
            providers: providers?.length || 0,
            services: services?.length || 0,
            horarios: horarios?.length || 0
        })

        return (
            <div className="row g-3">
                {/* Seleção de Profissional */}
                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Profissional
                    </label>
                    <select 
                        className="form-control"
                        value={this.state.selectedProvider?.id || ''}
                        onChange={(e) => {
                            const provider = providers.find(p => p.id === e.target.value)
                            this.handleProviderChange(provider)
                        }}
                    >
                        <option value="">Selecione um profissional</option>
                        {providers?.map(provider => (
                            <option key={provider.id} value={provider.id}>
                                {provider.nome}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Seleção de Serviço */}
                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-cut me-2"></i>
                        Serviço
                    </label>
                    <select 
                        className="form-control"
                        value={this.state.selectedService?.id || ''}
                        onChange={(e) => {
                            const service = services?.find(s => s.id === e.target.value)
                            this.handleServiceChange(service)
                        }}
                        disabled={!this.state.selectedProvider}
                    >
                        <option value="">Selecione um serviço</option>
                        {services?.map(service => (
                            <option key={service.id} value={service.id}>
                                {service.nome} - <PriceFormat value={service.preco} />
                            </option>
                        ))}
                    </select>
                </div>

                {/* Seleção de Data */}
                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-calendar me-2"></i>
                        Data
                    </label>
                    <select 
                        className="form-control"
                        value={this.state.selectedDate?.date?.seconds || ''}
                        onChange={(e) => {
                            const date = horarios?.find(h => h.date?.seconds === parseInt(e.target.value))
                            this.handleDateChange(date)
                        }}
                        disabled={!this.state.selectedService}
                    >
                        <option value="">Selecione uma data</option>
                        {horarios?.filter(h => h.isDayAllowed).map(day => (
                            <option key={day.date?.seconds} value={day.date?.seconds}>
                                {day.dia} - {dateToString(day.date)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Seleção de Horário */}
                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-clock me-2"></i>
                        Horário
                    </label>
                    <select 
                        className="form-control"
                        value={this.state.selectedHour || ''}
                        onChange={(e) => this.handleHourChange(e.target.value)}
                        disabled={!this.state.selectedDate || this.state.isLoading}
                    >
                        <option value="">Selecione um horário</option>
                        {this.state.availableHours?.filter(h => h.available).map(hour => (
                            <option key={hour.hour} value={hour.hour}>
                                {hour.hour}
                            </option>
                        ))}
                    </select>
                    {this.state.isLoading && (
                        <small className="text-muted">
                            <i className="fas fa-spinner fa-spin me-1"></i>
                            Carregando horários...
                        </small>
                    )}
                </div>

                {/* Dados do Cliente */}
                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Nome do Cliente *
                    </label>
                    <input 
                        type="text"
                        className="form-control"
                        placeholder="Nome completo do cliente"
                        value={this.state.clientName}
                        onChange={(e) => this.setState({ clientName: e.target.value })}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label">
                        <i className="fas fa-phone me-2"></i>
                        Telefone
                    </label>
                    <PhoneNumberInput 
                        value={this.state.clientPhone}
                        onChange={(e) => this.setState({ clientPhone: e.target.value })}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label">
                        <i className="fas fa-comment me-2"></i>
                        Observações
                    </label>
                    <textarea 
                        className="form-control"
                        placeholder="Observações sobre o atendimento (opcional)"
                        rows="3"
                        value={this.state.clientObservation}
                        onChange={(e) => this.setState({ clientObservation: e.target.value })}
                    />
                </div>

                {/* Botões */}
                <div className="col-12">
                    <div className="d-flex gap-2">
                        <button 
                            className="btn btn-success"
                            onClick={this.handleSubmit}
                            disabled={!this.state.selectedProvider || !this.state.selectedService || !this.state.selectedDate || !this.state.selectedHour || !this.state.clientName.trim()}
                        >
                            <i className="fas fa-calendar-check me-2"></i>
                            Marcar Horário
                        </button>
                        
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={this.resetForm}
                        >
                            <i className="fas fa-undo me-2"></i>
                            Limpar
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export { QuickAppointment }
