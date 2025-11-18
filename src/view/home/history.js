import React from "react";
import { updateAppointment } from "../../store/collections/appointmentWorker";
import { getEstabelecimento, getSessao } from '../../config/auth';
import { AppointmentCard } from "../../components/AppointmentCard";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { hoursArrayToString, dateToString } from "../../shared/utils";
import { completeAvailableHours, setAvailableHours } from '../../services/appointment/appointmentService'
import { Appointment } from "./appointment";

class History extends React.Component {
    constructor(props) {
        super(props);
            this.state = {
            establishment: getEstabelecimento(),
            providers: props.appoitmentData?.providers || [],
            horarios: props.appoitmentData?.horarios || [],
            appointmentsOriginal: props.appointments || [],
            appointments: props.appointments || [],
            TodaysDayOfWeek: new Date().getDay(),
            sessao: getSessao(),
            editingAppointmentModalOpen: false,
            editingAppointment: null,
            editingAppointmentDate: null,
            editingAppointmentHour: null,
            editingAppointmentProvider: null,
            editingAppointmentService: null,
            editingAppointmentClientName: null,
            editingAppointmentClientPhone: null,
            editingAppointmentDates: [],
            editingAppoitmentAvailableHours: [],
            edditingAppointmentHourSelected: [],
            edditingAppointmentHourSelectedOriginal: []
        }
    }

    componentDidMount() {
        this.load()
    }

    componentDidUpdate(prevProps) {
            if (prevProps.appointments !== this.props.appointments) {
            this.setState({
                appointmentsOriginal: this.props.appointments || [],
                appointments: this.props.appointments || [],
                providers: this.props.appoitmentData.providers,
                horarios: this.props.appoitmentData.horarios
                }, () => {
                this.load()
            })
        }
    }

  load = () => {
        const appointments = this.state.appointmentsOriginal
        const providers = [...new Map(appointments.flatMap(d => d.agendamentos).map(a => [a.provider.id, a.provider])).values()]
        this.setState({ providers: providers })
    }

    selectProvider = (provider) => () => {
        if (!provider) {
            this.setState({ 
                appointments: this.state.appointmentsOriginal,
            })
            return
        }

        const filteredAppointments = this.state.appointmentsOriginal.map(day => ({
            day: day.day,
            indexDayOfWeek: day.indexDayOfWeek,
            agendamentos: day.agendamentos.filter(appointment => appointment.provider.id === provider.id)
        })).filter(day => day.agendamentos.length > 0)
        this.setState({ 
            appointments: filteredAppointments,
        })
    }

    verifyIfToday = (indexDayOfWeek) => {
        if (indexDayOfWeek === this.state.TodaysDayOfWeek) {
            return "  (Hoje)"
        }
        return ""
    }

    showEditingAppointmentModal = async (appointment) => {
        const horarios = this.state.sessao.horarios
        const completedAvailableHours = completeAvailableHours(horarios[0] ?? [])
        const appoitmentData = {
            appointment: appointment,
            horarios: completedAvailableHours,
            providers: [appointment.provider],
            appointmentTitle: 'Selecione um horário',
            mininumStep: 2,
            originalHourSelected: appointment.dateInfo.hour,
        }
        this.setState({
            editingAppointmentModalOpen: true, 
            appoitmentData: appoitmentData,
            editingAppointment: { ...appointment }
        })
    }

    hideEditingAppointment = () => {
        this.setState({ editingAppointmentModalOpen: false, editingAppointment: null })
    }

    handleEditAppointment = async () => {
        this.hideEditingAppointment()
    }

    handleEditDate = (day) => {
        const selectedDate = day.target.value
        this.setState({ editingAppointmentDate: selectedDate });
    }

    reload = () => {
        this.hideEditingAppointment()
        this.props.reload()
    }

    handleCancelAppointment = async () => {
        const data = {
            ...this.state.editingAppointment,
            canceledAt: new Date(),
            canceledBy: this.state.sessao.usuario.id,
            isCanceled: true,
        }
        try {
            await updateAppointment(data)
            this.reload()
        } catch (error) {
            console.error("Erro ao realizar agendamento:", error.message)
        }
    }

    render() {
        return (
            <div className="history">
                <div className={"d-flex justify-content-center py-5"}>
                    <div className="card shadow-lg border-0" style={{ 
                        borderRadius: 'var(--radius-xl)', 
                        maxWidth: '800px', 
                        width: '100%',
                        background: 'var(--bg-primary)'
                    }}>
                    <div className="card-header" style={{ 
                        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                        color: 'var(--text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                    }}>
                        <h4 className="mb-0 text-center" style={{ 
                            fontSize: 'var(--font-size-xl)', 
                            fontWeight: 'var(--font-weight-bold)'
                        }}>
                            <i className="fas fa-calendar-alt me-2"></i>
                            Próximos Agendamentos
                        </h4>
                    </div>
                    <div className="card-body p-4">
                    {
                        this.state.appointments.length === 0 ? (
                            <div className="text-center py-5">
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'var(--neutral-200)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto var(--spacing-lg)',
                                    color: 'var(--text-tertiary)',
                                    fontSize: 'var(--font-size-3xl)'
                                }}>
                                    <i className="fas fa-calendar-times"></i>
                                </div>
                                <h5 style={{ 
                                    color: 'var(--text-secondary)', 
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-sm)'
                                }}>
                                    Nenhum agendamento encontrado
                                </h5>
                                <p style={{ 
                                    color: 'var(--text-tertiary)', 
                                    fontSize: 'var(--font-size-sm)',
                                    margin: 0
                                }}>
                                    Não há agendamentos para os próximos 7 dias.
                                </p>
                            </div>
                        ) : (
                            <>
                                {
                                    this.state.providers.length > 0 && (
                                        <div className="mb-4">
                                            <h6 style={{ 
                                                fontSize: 'var(--font-size-base)', 
                                                fontWeight: 'var(--font-weight-semibold)',
                                                color: 'var(--text-primary)',
                                                marginBottom: 'var(--spacing-md)'
                                            }}>
                                                <i className="fas fa-filter me-2"></i>
                                                Filtrar por Profissional
                                            </h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                <button className="btn btn-outline-primary" 
                                                        onClick={this.selectProvider()}
                                                        style={{
                                                            borderRadius: 'var(--radius-md)',
                                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                                            fontSize: 'var(--font-size-sm)',
                                                            fontWeight: 'var(--font-weight-medium)'
                                                        }}>
                                                    <i className="fas fa-users me-1"></i>
                                                    Todos
                                                </button>
                                                {
                                                    this.state.providers.map((provider, index) => (
                                                        <button key={index}
                                                                className="btn btn-outline-primary" 
                                                                onClick={this.selectProvider(provider)}
                                                                style={{
                                                                    borderRadius: 'var(--radius-md)',
                                                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                                                    fontSize: 'var(--font-size-sm)',
                                                                    fontWeight: 'var(--font-weight-medium)'
                                                                }}>
                                                            <i className="fas fa-user me-1"></i>
                                                            {provider.nome}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                                <ul className="list-group">
                                    {
                                        this.state.appointments.map((appointment, index) => (
                                            <>
                                                <div className="text-center my-4">
                                                    <h5 style={{ 
                                                        fontSize: 'var(--font-size-lg)', 
                                                        fontWeight: 'var(--font-weight-semibold)',
                                                        color: 'var(--text-primary)',
                                                        margin: 0,
                                                        padding: 'var(--spacing-md)',
                                                        background: 'var(--bg-secondary)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        border: '1px solid var(--neutral-200)'
                                                    }}>
                                                        <i className="fas fa-calendar-day me-2"></i>
                                                        {appointment.day}{this.verifyIfToday(appointment.indexDayOfWeek)}
                                                    </h5>
                                                </div>
                                                {
                                                    this.state.appointments[index].agendamentos.map((agendamento) => (
                                                        <AppointmentCard 
                                                            key={Math.random()}
                                                            appointment={agendamento}
                                                            establishment={this.state.establishment}
                                                            showEditingAppointmentModal={() => this.showEditingAppointmentModal(agendamento)}
                                                        />
                                                    ))
                                                }
                                            </>
                                        ))
                                    }
                                </ul>
                            </>
                        )
                    }
                    </div>
                </div>
                <Dialog onClose={this.hideEditingAppointment} maxWidth="md" fullWidth open={this.state.editingAppointmentModalOpen} >
                    {
                        this.state.editingAppointmentModalOpen && (
                            <div className="container d-flex flex-column align-items-center">
                                <h5 className="text-center mt-3">Editando Agendamento</h5>
                                <Appointment isEditingAppointment={true} reload={this.reload} appoitmentData={this.state.appoitmentData} hideEditingAppointment={this.hideEditingAppointment}/>
                                <button className="btn btn-danger mb-3" onClick={this.handleCancelAppointment}>
                                    Cancelar Agendamento
                                </button>
                            </div>
                        )
                    }
                </Dialog>
                </div>
            </div>
        );
    }
}

export { History }