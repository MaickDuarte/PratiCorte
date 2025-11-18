import React from "react";
import { getSessao, getEstabelecimento } from "../../config/auth";
import { NavBar } from "../../components/navbar";
import { getAppointmentsByDate } from "../../store/collections/appointmentWorker";
import { getActiveUsersAppointmentAllowed } from '../../store/collections/userWorker';
import { Appointment } from "./appointment";
import { History } from "./history";
import { groupAgendamentosByDayOfWeek, completeAvailableHours } from "../../services/appointment/appointmentService";
import Dialog from '@mui/material/Dialog';


class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            establishment: getEstabelecimento(),
            sessao: getSessao(),
            appointments: [],
            showAppointmentForm: false,
            showAppointmentModal: false
        }
    }

    async componentDidMount() {
        this.load()
    }

    load = async () => {
        this.setState({ showAppointmentModal: false })
        try {
            const today = new Date()
            const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
            const appointments = await getAppointmentsByDate(this.state.establishment.id, today, endDate)
            const groupedAppointments = groupAgendamentosByDayOfWeek(appointments)

            const providers = await getActiveUsersAppointmentAllowed(this.state.establishment.id)
            const horarios = this.state.sessao.horarios
            const completedAvailableHours = completeAvailableHours(horarios[0] ?? [])
            
            const appoitmentData = {
                horarios: completedAvailableHours,
                providers: providers,
                appointmentTitle: 'Realize um agendamento',
            }
            this.setState({
                appointments: groupedAppointments, 
                appoitmentData: appoitmentData
            })
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            this.setState({
                appointments: [],
                appoitmentData: {
                    horarios: [],
                    providers: [],
                    appointmentTitle: 'Realize um agendamento',
                }
            })
        }
    }

    render() {
        return (
            <>
                <NavBar />
                <div className="container py-4">
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-lg border-0" style={{ 
                                borderRadius: 'var(--radius-xl)', 
                                background: 'var(--bg-primary)'
                            }}>
                                <div className="card-body p-4 text-center">
                                    <button className="btn btn-success btn-lg" 
                                            onClick={() => this.setState({ showAppointmentModal: true })}
                                            style={{
                                                padding: 'var(--spacing-md) var(--spacing-xl)',
                                                fontSize: 'var(--font-size-base)',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                borderRadius: 'var(--radius-lg)'
                                            }}>
                                        <i className="fas fa-calendar-plus me-2"></i>
                                        Marcar Horário
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <History appointments={this.state.appointments} reload={this.load} appoitmentData={this.state.appoitmentData}/>
                        </div>
                    </div>
                </div>
                <Dialog open={this.state.showAppointmentModal} onClose={() => this.setState({ showAppointmentModal: false })} maxWidth="md" fullWidth>
                    <Appointment reload={this.load} appoitmentData={this.state.appoitmentData}/>
                </Dialog>
            </>
        );
    }
}

export { Home };
