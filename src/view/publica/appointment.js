import React from "react"
import { useParams, useNavigate } from "react-router-dom"
import Dialog from "@mui/material/Dialog"
import { Appointment } from "../home/appointment"
import { getAppointmentsByDateAPI } from "../../store/collections/appointmentWorker"
import { getActiveUsersAppointmentAllowedAPI } from "../../store/collections/userWorker"
import { groupAgendamentosByDayOfWeek, completeAvailableHours } from "../../services/appointment/appointmentService"
import { getEstablishmentById } from "../../store/collections/establishmentWorker"
import { PhoneNumberFormat, DocumentFormat, isEmpty } from "../../shared/utils"
import { getOpeningHoursAPI } from "../../store/collections/openingHoursWorker"
import { PublicNavBar } from "../../components/publicNavBar"

export const ClientAppointment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  return (<ClientAppointmentClass estabelecimentoId={id} navigate={navigate}/>)
}

class ClientAppointmentClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      establishment: null,
      appointments: [],
      appoitmentData: { horarios: [], providers: [], appointmentTitle: "Realize um agendamento" },
      showAppointmentModal: false,
      showSuccessModal: false,
      successData: null,
      loading: true,
    }
  }

  async componentDidMount() { this.load() }

  load = async () => {
    try {
      const establishment = await getEstablishmentById(this.props.estabelecimentoId)
      this.setState({ establishment })
      const today = new Date()
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
      const appointments = await getAppointmentsByDateAPI(establishment.id, today, endDate)
      const groupedAppointments = groupAgendamentosByDayOfWeek(appointments)
      this.setState({ appointments: groupedAppointments })
      const providers = await getActiveUsersAppointmentAllowedAPI(establishment.id)
      const horarios = await getOpeningHoursAPI(establishment.id)
      const completedAvailableHours = completeAvailableHours(horarios[0] ?? [])
      this.setState({
        appoitmentData: {
          horarios: completedAvailableHours,
          providers,
          appointmentTitle: `Agende em ${establishment.nomeEstabelecimento}`,
        },
        loading: false,
      })
    } catch (error) {
      this.setState({ loading: false })
    }
  }

  finishPublicAppointment = (data) => {
    this.setState({ showAppointmentModal: false, showSuccessModal: true, successData: data })
  }

  closeFinishedModal = () => {
    this.setState({ showSuccessModal: false })
  }

  render() {
    if (this.state.loading) {
      return <div className="text-center py-5">Carregando...</div>
    }
    return (
      <>
        <PublicNavBar />
        <div className="container py-4 mt-5">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body position-relative">
              <div className="dropdown position-absolute" style={{ top: 16, right: 16 }} >
                <button className="btn btn-outline-secondary dropdown-toggle border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false"
                  style={{ background: "transparent", boxShadow: "none" }} >
                  <i className="fas fa-bars"></i>
                </button>

                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0"
                    style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--neutral-200)", minWidth: "220px" }} >
                  <li>
                    <button className="dropdown-item d-flex align-items-center py-2" onClick={() => this.props.navigate("/")}
                      style={{ color: "var(--text-primary)", textDecoration: "none", transition: "all var(--transition-fast)" }} >
                      <i className="fas fa-store me-3"></i>
                      Acessar estabelecimento
                    </button>
                  </li>
                </ul>
              </div>
              <h4 className="mb-3 fw-bold"> {this.state.establishment?.nomeEstabelecimento || "Estabelecimento"} </h4>
              <div className="text-muted">
                <div>
                  📞{" "}
                  {!isEmpty(this.state.establishment?.celular) ? <PhoneNumberFormat value={this.state.establishment.celular} /> : "Não informado"}
                </div>
                <div>
                  📍{" "}
                  {!isEmpty(this.state.establishment?.endereco) ? this.state.establishment.endereco : "Não informado"}
                </div>
                <div>
                  🧾{" "}
                  {!isEmpty(this.state.establishment?.documento) ? <DocumentFormat value={this.state.establishment.documento} /> : "Não informado"}
                </div>
              </div>
            </div>
          </div>
          <div className="card shadow-lg border-0 text-center">
            <div className="card-body p-5">
              <button className="btn btn-success btn-lg w-100" onClick={() => this.setState({ showAppointmentModal: true }) }
                style={{ padding: "18px", fontSize: "1.1rem", fontWeight: 600, borderRadius: "var(--radius-lg)" }}>
                <i className="fas fa-calendar-check me-2"></i>
                Realize aqui o seu agendamento
              </button>
            </div>
          </div>
        </div>
        <Dialog open={this.state.showAppointmentModal} onClose={() => this.setState({ showAppointmentModal: false })} maxWidth="md" fullWidth>
          <Appointment reload={this.load} appoitmentData={this.state.appoitmentData} establishment={this.state.establishment} isPublic={true} finishPublicAppointment={this.finishPublicAppointment} />
        </Dialog>
        <Dialog open={this.state.showSuccessModal} maxWidth="xs" fullWidth>
          <div className="p-4 text-center">
            <div className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
              style={{ width: 90, height: 90, borderRadius: "50%", background: "#22c55e", animation: "scaleIn 0.4s ease-out" }}>
              <i className="fas fa-check text-white" style={{ fontSize: 40 }}></i>
            </div>
            <h5 className="fw-bold mb-4">Agendamento realizado com sucesso</h5>
            <div className="text-start text-muted mb-4" style={{ fontSize: "0.95rem" }}>
              <div><strong>Cliente:</strong> {this.state.successData?.cliente?.nome}</div>
              <div><strong>Telefone:</strong> {this.state.successData?.cliente?.celular}</div>
              <div><strong>Horário:</strong> {this.state.successData?.dateInfo?.hour}</div>
              <div><strong>Serviço:</strong> {this.state.successData?.service?.nome}</div>
              <div><strong>Observações:</strong> {this.state.successData?.cliente?.observacao}</div>
            </div>
            <button className="btn btn-success w-100" onClick={this.closeFinishedModal} style={{ padding: "12px", fontWeight: 600, borderRadius: "var(--radius-lg)" }}>
              Voltar para tela inicial
            </button>
          </div>
        </Dialog>
      </>
    )
  }
}

export default ClientAppointment
