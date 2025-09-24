import React from "react";
import { NavBar } from "../../components/navbar";
import { getEstabelecimento } from "../../config/auth";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";
import { getAppointmentByProviderAndDate } from "../../store/collections/appointmentWorker";
import { getActiveUsersAppointmentAllowed } from '../../store/collections/userWorker';
import { groupByProviderAndDate } from '../../services/appointment/appointmentService';
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
            providersIds: []
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        const providers = await getActiveUsersAppointmentAllowed(this.state.establishment.id)
        const providersIds = providers.map(p => p.id)
        this.setState({ 
            providers: providers,
            providersIds: providersIds
         },() => {
            this.applyFilter()
        })
    }

    applyFilter = async () => {
        var appointments = await getAppointmentByProviderAndDate(this.state.providersIds, this.state.startDate, this.state.endDate)
        this.setState({ 
            allAppointments: appointments,
         },() => {
            this.groupByProviderAndDate()
        })
    }

    handleDateChange = (field, date) => {
        this.setState({ [field]: date[0] })
    }

    groupByProviderAndDate = () => {
        var filteredAppointments = groupByProviderAndDate(this.state.allAppointments)
        this.setState({ 
            filteredAppointments: filteredAppointments
         })
    }

    render() {
        return (
            <>
                <NavBar />
                <div className="container-fluid mt-3">
                    <div className="row">
                        <div className="col-12 col-md-3 mb-3">
                            <div className="card p-3 shadow bg-white rounded h-100">
                                <h5>Filtro de Agendamentos</h5>
                                <label>Início</label>
                                <Flatpickr value={this.state.startDate} options={{ dateFormat: "d/m/Y", locale: Portuguese }} onChange={(date) => this.handleDateChange("startDate", date)} className="form-control"/>
                                <label className="mt-3">Fim</label>
                                <Flatpickr value={this.state.endDate} options={{ dateFormat: "d/m/Y", locale: Portuguese }} onChange={(date) => this.handleDateChange("endDate", date)} className="form-control"/>
                                <button className="btn btn-primary mt-3 w-100" onClick={this.applyFilter}>
                                    Filtrar
                                </button>
                            </div>
                        </div>
                        {
                            this.state.filteredAppointments.length > 0 &&
                            <div className="col-12 col-md-9">
                                <div className="row">
                                    {
                                        this.state.filteredAppointments.map(provider => (
                                    <div key={provider.id} className="col-12 col-md-6 col-lg-6 mb-3">
                                        <div className="card shadow bg-white rounded">
                                            <div className="card-header bg-primary text-white" data-bs-toggle="collapse" data-bs-target={`#provider-${provider.id}`} style={{ cursor: "pointer" }}>
                                                {provider.nome}
                                            </div>
                                            <div id={`provider-${provider.id}`} className="collapse show">
                                                <div className="card-body">
                                                    {
                                                        provider.dates.length > 0 ? (
                                                            provider.dates.map(dateGroup => (
                                                            <div key={dateGroup.date} className="mb-3">
                                                                <h6 className="text-muted">{`${secondsToDateString(dateGroup.date)} - ${dateGroup.titleDayOfWeek}`}</h6>
                                                                <ul className="list-group">
                                                                {
                                                                    dateGroup.appointments.map(appointment => (
                                                                        <li key={appointment.id} className="list-group-item d-flex justify-content-between align-items-start">
                                                                            <div className="d-flex flex-column">
                                                                                <span><strong>{appointment.cliente?.nome || "-"}</strong></span>
                                                                                <span>{hoursArrayToString(appointment.dateInfo?.hour) || "-"}</span>
                                                                                <span>{appointment.service?.nome || "-"}</span>
                                                                            </div>

                                                                            <span className="badge bg-secondary align-self-center">
                                                                                {appointment.status || "Pendente"}
                                                                            </span>
                                                                        </li>
                                                                    ))
                                                                }
                                                                </ul>
                                                            </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-muted">Nenhum agendamento.</p>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </>
        )
    }
}

export { History }