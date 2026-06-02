import React from "react";
import { NavBar } from "../../components/navbar";
import { getEstabelecimento } from "../../config/auth";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import { getAppointmentByProviderAndDateAPI } from "../../store/collections/appointmentWorker";
import { getActiveUsersAppointmentAllowedAPI } from '../../store/collections/userWorker';
import { groupByProviderAndDate, isPastDateTime } from '../../services/appointment/appointmentService';
import { secondsToDateString, hoursArrayToString } from "../../shared/utils";

class History extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            establishment: getEstabelecimento(),
            providers: [],
            startDate: new Date(),
            endDate: new Date(),
            allAppointments: [],
            filteredAppointments: [],
            providersIds: [],
            isLoading: false,
            errorMessage: ""
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        this.setState({ isLoading: true, errorMessage: "" })
        try {
            const providers = await getActiveUsersAppointmentAllowedAPI(this.state.establishment.id)
            const providersIds = providers.map(p => p.id)
            this.setState({ 
                providers: providers,
                providersIds: providersIds
             },() => {
                this.applyFilter()
            })
        } catch (error) {
            this.setState({
                isLoading: false,
                errorMessage: error.message || "Erro ao carregar barbeiros."
            })
        }
    }

    applyFilter = async () => {
        this.setState({ isLoading: true, errorMessage: "" })

        if (this.state.providersIds.length === 0) {
            this.setState({ allAppointments: [], filteredAppointments: [], isLoading: false })
            return
        }

        try {
            const appointmentsByProvider = await Promise.all(
                this.state.providersIds.map(providerId => getAppointmentByProviderAndDateAPI(providerId, this.state.startDate, this.state.endDate))
            )
            var appointments = appointmentsByProvider.flat()
            this.setState({ 
                allAppointments: appointments,
            },() => {
                this.groupByProviderAndDate()
            })
        } catch (error) {
            this.setState({
                allAppointments: [],
                filteredAppointments: [],
                isLoading: false,
                errorMessage: error.message || "Erro ao filtrar agendamentos."
            })
        }
    }

    handleDateChange = (field, date) => {
        this.setState({ [field]: date[0] })
    }

    groupByProviderAndDate = () => {
        var filteredAppointments = groupByProviderAndDate(this.state.allAppointments)
        this.setState({ 
            filteredAppointments: filteredAppointments,
            isLoading: false
         })
    }

    getProviderAppointmentsCount = (provider) => {
        return provider.dates.reduce((total, dateGroup) => total + dateGroup.appointments.length, 0)
    }

    getStatus = (appointment) => {
        if (appointment.isCanceled === true) {
            return "Cancelado"
        }
        if (appointment.isFinished === true) {
            return "Finalizado"
        }
        if (isPastDateTime(appointment.dateInfo)) {
            return "Vencido"
        }
        return appointment.status || "Pendente"
    }

    getStatusClassName = (appointment) => {
        if (appointment.isCanceled === true) {
            return "history-status-canceled"
        }
        if (appointment.isFinished === true) {
            return "history-status-finished"
        }
        if (isPastDateTime(appointment.dateInfo)) {
            return "history-status-expired"
        }
        return "history-status-pending"
    }

    render() {
        return (
            <>
                <NavBar />
                <div className="container-fluid history-page-container">
                    <div className="row g-4 align-items-start">
                        <div className="col-12 col-lg-3">
                            <div className="card history-filter-card p-4 shadow-lg border-0">
                                <div className="text-center mb-4">
                                    <h5 style={{ 
                                        fontSize: 'var(--font-size-xl)', 
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--text-primary)',
                                        margin: 0
                                    }}>
                                        <i className="fas fa-filter me-2"></i>
                                        Filtro de Agendamentos
                                    </h5>
                                </div>

                                {
                                    this.state.errorMessage &&
                                    <div className="history-error-message mb-3">
                                        <i className="fas fa-exclamation-circle"></i>
                                        <span>{this.state.errorMessage}</span>
                                    </div>
                                }
                                
                                <div className="mb-3">
                                    <label className="form-label" style={{ 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        Início
                                    </label>
                                    <Flatpickr 
                                        value={this.state.startDate} 
                                        options={{ dateFormat: "d/m/Y", locale: Portuguese }} 
                                        onChange={(date) => this.handleDateChange("startDate", date)} 
                                        className="form-control"
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </div>
                                
                                <div className="mb-4">
                                    <label className="form-label" style={{ 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--text-primary)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}>
                                        Fim
                                    </label>
                                    <Flatpickr 
                                        value={this.state.endDate} 
                                        options={{ dateFormat: "d/m/Y", locale: Portuguese }} 
                                        onChange={(date) => this.handleDateChange("endDate", date)} 
                                        className="form-control"
                                        style={{ paddingLeft: '2.5rem' }}
                                    />
                                </div>
                                
                                <button className="btn btn-primary w-100" 
                                        onClick={this.applyFilter}
                                        disabled={this.state.isLoading}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            fontSize: 'var(--font-size-base)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                    {
                                        this.state.isLoading ? (
                                            <>
                                                <span className="spinner spinner-light"></span>
                                                Filtrando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-search me-2"></i>
                                                Filtrar
                                            </>
                                        )
                                    }
                                </button>
                            </div>
                        </div>
                        <div className="col-12 col-lg-9">
                        {
                            this.state.isLoading &&
                            <div className="history-loading-state">
                                <span className="spinner"></span>
                                <h5>Buscando agendamentos</h5>
                                <p>Aguarde enquanto carregamos o histórico do período selecionado.</p>
                            </div>
                        }
                        {
                            !this.state.isLoading && this.state.errorMessage &&
                            <div className="history-error-state">
                                <div>
                                    <i className="fas fa-triangle-exclamation"></i>
                                </div>
                                <h5>Não foi possível filtrar</h5>
                                <p>{this.state.errorMessage}</p>
                            </div>
                        }
                        {
                            !this.state.isLoading && !this.state.errorMessage && this.state.filteredAppointments.length > 0 &&
                            <>
                                <div className="history-results-header mb-3">
                                    <div>
                                        <h5>
                                            <i className="fas fa-calendar-check me-2"></i>
                                            Agendamentos encontrados
                                        </h5>
                                        <span>Organizados por barbeiro, da data mais recente para a mais antiga.</span>
                                    </div>
                                    <strong>{this.state.allAppointments.length}</strong>
                                </div>
                                <div className="row g-3 align-items-start">
                                    {
                                        this.state.filteredAppointments.map((provider, providerIndex) => (
                                    <div key={provider.id || providerIndex} className="col-12 col-lg-6 col-xl-4">
                                        <div className="card history-provider-card">
                                            <div className="history-provider-header" data-bs-toggle="collapse" data-bs-target={`#provider-${provider.id}`}>
                                                <div>
                                                    <h6>{provider.nome}</h6>
                                                    <span>{this.getProviderAppointmentsCount(provider)} agendamento(s)</span>
                                                </div>
                                                <i className="fas fa-chevron-down"></i>
                                            </div>
                                            <div id={`provider-${provider.id}`} className="collapse show">
                                                <div className="card-body history-provider-body">
                                                    {
                                                        provider.dates.length > 0 ? (
                                                            provider.dates.map((dateGroup, dateIndex) => (
                                                            <div key={`${provider.id}-${dateGroup.date || dateIndex}`} className="history-date-group">
                                                                <div className="history-date-title">
                                                                    <i className="fas fa-calendar-day"></i>
                                                                    <span>{secondsToDateString(dateGroup.date)}</span>
                                                                    <small>{dateGroup.titleDayOfWeek}</small>
                                                                </div>
                                                                <div className="history-appointment-grid">
                                                                {
                                                                    dateGroup.appointments.map((appointment, appointmentIndex) => (
                                                                        <div key={`${provider.id}-${dateGroup.date}-${appointment.id || appointmentIndex}`} className="history-appointment-card">
                                                                            <div className="history-appointment-top">
                                                                                <strong>{hoursArrayToString(appointment.dateInfo?.hour) || "-"}</strong>
                                                                                <span className={`history-status ${this.getStatusClassName(appointment)}`}>
                                                                                    {this.getStatus(appointment)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="history-appointment-info">
                                                                                <div>
                                                                                    <i className="fas fa-user"></i>
                                                                                    <span>{appointment.cliente?.nome || "Cliente não informado"}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <i className="fas fa-cut"></i>
                                                                                    <span>{appointment.service?.nome || "Serviço não informado"}</span>
                                                                                </div>
                                                                                <div>
                                                                                    <i className="fas fa-phone"></i>
                                                                                    <span>{appointment.cliente?.celular || "Celular não informado"}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                                </div>
                                                            </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted mb-0">Nenhum agendamento.</p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </>
                        }
                        {
                            !this.state.isLoading && !this.state.errorMessage && this.state.providersIds.length > 0 && this.state.filteredAppointments.length === 0 &&
                            <>
                                <div className="history-empty-state">
                                    <div>
                                        <i className="fas fa-calendar-times"></i>
                                    </div>
                                    <h5>Nenhum agendamento encontrado</h5>
                                    <p>Altere o período do filtro para visualizar os agendamentos dos barbeiros.</p>
                                </div>
                            </>
                        }
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export { History }
