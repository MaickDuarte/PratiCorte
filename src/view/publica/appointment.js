import React from "react"
import { useParams } from "react-router-dom"
import Dialog from "@mui/material/Dialog"

import { Appointment } from "../home/appointment"
import { getAppointmentsByDateAPI } from "../../store/collections/appointmentWorker"
import { getActiveUsersAppointmentAllowed } from "../../store/collections/userWorker"
import { groupAgendamentosByDayOfWeek, completeAvailableHours } from "../../services/appointment/appointmentService"
import { getEstablishmentById } from "../../store/collections/establishmentWorker"

export const ClientAppointment = () => {
  const { id } = useParams()
  return <ClientAppointmentClass estabelecimentoId={id} />
}

class ClientAppointmentClass extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      establishment: null,
      appointments: [],
      appoitmentData: {
        horarios: [],
        providers: [],
        appointmentTitle: "Realize um agendamento",
      },
      showAppointmentModal: false,
      loading: true,
    }
  }

  async componentDidMount() {
    this.load()
  }

  load = async () => {
    try {
      const establishment = await getEstablishmentById(this.props.estabelecimentoId)
      console.log(establishment)

      const today = new Date()
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

      const appointments = await getAppointmentsByDateAPI(
        establishment.id,
        today,
        endDate
      )

      const groupedAppointments = groupAgendamentosByDayOfWeek(appointments)

      const providers = await getActiveUsersAppointmentAllowed(establishment.id)

      const horarios = establishment.horarios || []
      const completedAvailableHours = completeAvailableHours(horarios[0] ?? [])

      this.setState({
        establishment,
        appointments: groupedAppointments,
        appoitmentData: {
          horarios: completedAvailableHours,
          providers,
          appointmentTitle: `Agende em ${establishment.nome}`,
        },
        loading: false,
      })
    } catch (error) {
      console.error("Erro ao carregar dados públicos:", error)
      this.setState({ loading: false })
    }
  }

  render() {
    if (this.state.loading) {
      return <div className="text-center py-5">Carregando...</div>
    }

    return (
      <>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-6">
              <div
                className="card shadow-lg border-0 text-center"
                style={{
                  borderRadius: "var(--radius-xl)",
                  background: "var(--bg-primary)",
                }}
              >
                <div className="card-body p-4">
                  <h3 className="mb-3">
                    {this.state.establishment.nome}
                  </h3>

                  <button
                    className="btn btn-success btn-lg"
                    onClick={() =>
                      this.setState({ showAppointmentModal: true })
                    }
                    style={{
                      padding: "var(--spacing-md) var(--spacing-xl)",
                      fontSize: "var(--font-size-base)",
                      fontWeight: "var(--font-weight-semibold)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <i className="fas fa-calendar-plus me-2"></i>
                    Marcar Horário
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog
          open={this.state.showAppointmentModal}
          onClose={() => this.setState({ showAppointmentModal: false })}
          maxWidth="md"
          fullWidth
        >
          <Appointment
            reload={this.load}
            appoitmentData={this.state.appoitmentData}
            isPublic={true}
          />
        </Dialog>
      </>
    )
  }
}

export default ClientAppointment
