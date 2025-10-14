import React from "react";
import { getSessao, getEstabelecimento } from "../../config/auth";
import { NavBar } from "../../components/navbar";
import { getAppointmentsByDate } from "../../store/collections/appointmentWorker";
import { getActiveUsersAppointmentAllowed } from '../../store/collections/userWorker';
import { getServices } from '../../store/collections/servicesWorker';
import { Appointment } from "./appointment";
import { History } from "./history";
import { groupAgendamentosByDayOfWeek, completeAvailableHours } from "../../services/appointment/appointmentService";
import { Link } from "react-router-dom";
import { QuickAppointment } from "../../components/QuickAppointment";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';


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
        try {
            const today = new Date()
            const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
            const appointments = await getAppointmentsByDate(this.state.establishment.id, today, endDate)
            const groupedAppointments = groupAgendamentosByDayOfWeek(appointments)

            const providers = await getActiveUsersAppointmentAllowed(this.state.establishment.id)
            const services = await getServices(this.state.establishment.id) // Adicionar carregamento de serviços
            const horarios = this.state.sessao?.horarios
            const completedAvailableHours = horarios ? completeAvailableHours(horarios) : []
            
            console.log('Home.load - Dados carregados:', {
                providers: providers?.length || 0,
                services: services?.length || 0,
                horarios: horarios?.length || 0,
                completedAvailableHours: completedAvailableHours?.length || 0
            })
            
            const appoitmentData = {
                horarios: completedAvailableHours,
                providers: providers,
                services: services, // Adicionar serviços aos dados
                appointmentTitle: 'Realize um agendamento',
            }
            this.setState({
                appointments: groupedAppointments, 
                appoitmentData: appoitmentData
            })
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            // Definir estado padrão em caso de erro
            this.setState({
                appointments: [],
                appoitmentData: {
                    horarios: [],
                    providers: [],
                    services: [], // Adicionar serviços no estado de erro
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
                    {/* Botão de Acesso Rápido aos Horários */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-lg border-0" style={{ 
                                borderRadius: 'var(--radius-xl)', 
                                background: 'var(--bg-primary)'
                            }}>
                                <div className="card-body p-4 text-center">
                                    <h5 className="mb-3" style={{ 
                                        fontSize: 'var(--font-size-lg)', 
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--text-primary)'
                                    }}>
                                        <i className="fas fa-cog me-2"></i>
                                        Configurações Rápidas
                                    </h5>
                                    <Link to="/configuracoes/horarios" className="btn btn-primary btn-lg me-3" style={{
                                        padding: 'var(--spacing-md) var(--spacing-xl)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <i className="fas fa-clock me-2"></i>
                                        Configurar Horários
                                    </Link>
                                    <Link to="/configuracoes/servicos" className="btn btn-outline-primary btn-lg me-3" style={{
                                        padding: 'var(--spacing-md) var(--spacing-xl)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <i className="fas fa-cut me-2"></i>
                                        Gerenciar Serviços
                                    </Link>
                                    <Link to="/configuracoes/usuarios" className="btn btn-outline-primary btn-lg me-3" style={{
                                        padding: 'var(--spacing-md) var(--spacing-xl)',
                                        fontSize: 'var(--font-size-base)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <i className="fas fa-users me-2"></i>
                                        Cadastrar Profissionais
                                    </Link>
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
                    
                    
                    {/* Seção de Histórico */}
                    <div className="row">
                        <div className="col-12">
                    <History appointments={this.state.appointments} reload={this.load} appoitmentData={this.state.appoitmentData}/>
                </div>
                    </div>
                </div>
                
                {/* Modal de Agendamento */}
                <Dialog 
                    open={this.state.showAppointmentModal} 
                    onClose={() => this.setState({ showAppointmentModal: false })}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent style={{ padding: 0 }}>
                        <div className="card border-0 shadow-lg" style={{ 
                            borderRadius: 'var(--radius-xl)', 
                            background: 'var(--bg-primary)',
                            margin: 0
                        }}>
                            <div className="card-header" style={{ 
                                background: 'linear-gradient(135deg, var(--success-color) 0%, #059669 100%)',
                                color: 'var(--text-inverse)',
                                border: 'none',
                                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
                            }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="mb-0" style={{ 
                                        fontSize: 'var(--font-size-xl)', 
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        <i className="fas fa-calendar-plus me-2"></i>
                                        Marcar Horário
                                    </h4>
                                    <button 
                                        className="btn btn-outline-light btn-sm"
                                        onClick={() => this.setState({ showAppointmentModal: false })}
                                        style={{
                                            borderRadius: 'var(--radius-md)',
                                            padding: 'var(--spacing-sm) var(--spacing-md)'
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="card-body p-4">
                                {console.log('Home - Dados para QuickAppointment:', {
                                    providers: this.state.appoitmentData?.providers?.length || 0,
                                    services: this.state.appoitmentData?.services?.length || 0,
                                    horarios: this.state.appoitmentData?.horarios?.length || 0,
                                    appoitmentData: this.state.appoitmentData
                                })}
                                <QuickAppointment 
                                    providers={this.state.appoitmentData?.providers || []}
                                    horarios={this.state.appoitmentData?.horarios || []}
                                    services={this.state.appoitmentData?.services || []}
                                    establishment={this.state.establishment}
                                    onSuccess={() => {
                                        this.load()
                                        this.setState({ showAppointmentModal: false })
                                    }}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
}

export { Home };
