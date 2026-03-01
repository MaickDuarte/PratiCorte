import React from 'react';
import { secondsToDateString, hoursArrayToString } from "../shared/utils";
import { isPastDateTime } from "../services/appointment/appointmentService";
import { updateAppointmentAPI } from "../store/collections/appointmentWorker";
import { getSessao } from '../config/auth';

class AppointmentCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appointment: props.appointment,
            statusColor: this.handleStatusColor(props.appointment),
            status: this.handleStatus(props.appointment),
            sessao: getSessao(),
        }
    }

    handleStatus = (appointment) => {
        if (appointment.isCanceled === true) {
            return "Cancelado";
        }
        if (appointment.isFinished === true) {
            return "Finalizado";
        }
        if (isPastDateTime(appointment.dateInfo)) {
            return "Vencido";
        }
        return "Pendente";
    }

    handleStatusColor = (appointment) => {
        if (appointment.isCanceled === true) {
            return "text-bg-danger";
        }
        if (appointment.isFinished === true) {
            return "text-bg-success";
        }
        if (isPastDateTime(appointment.dateInfo)) {
            return "text-bg-secondary";
        }
        return "text-bg-primary";
    }

    handleFinalizeAppoitment = async () => {
        const data = {
            ...this.state.appointment,
            finishedBy: this.state.sessao.usuario.id,
            finishedAt: new Date(),
            isFinished: true,
        }
        try {
            await updateAppointmentAPI(data)
            this.setState({ status: "Finalizado", statusColor: "text-bg-success" })
        } catch (error) {
            console.error("Erro ao realizar agendamento:", error.message)
        }
    }

    handleEditAppointment = async () => {
        await this.props.showEditingAppointmentModal(this.state.appointment)
    }

    render() {
        return (
            <div className={`card ${this.state.statusColor} mb-2`}>
                <div className="card-header">
                    <strong title={this.state.appointment?.id} onClick={() => {navigator.clipboard.writeText(this.state.appointment.id);}}>
                        Status:</strong> {this.state.status}<br />
                    <strong>Data:</strong> {secondsToDateString(this.state.appointment.dateInfo?.date._seconds)}<br />
                    <strong>Horário:</strong> {hoursArrayToString(this.state.appointment.dateInfo?.hour)}
                    </div>
                        <div className="card-body d-flex justify-content-between align-items-center">
                        <div className="me-3">
                            <strong>Prestador:</strong> {this.state.appointment.provider?.nome}<br />
                            <strong>Serviço:</strong> {this.state.appointment.service?.nome}<br />
                            <strong>Cliente:</strong> {this.state.appointment.cliente?.nome}<br />
                            <strong>Celular:</strong> {this.state.appointment.cliente?.celular}<br />
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {
                                this.state.status !== "Finalizado" && this.state.status !== "Cancelado" && 
                                <button className="btn btn-success border border-white" onClick={this.handleFinalizeAppoitment}>
                                    <i className="fas fa-check" />
                                </button>
                            }
                            {
                                this.state.status !== "Cancelado" && 
                                <button className="btn btn-dark border border-white" onClick={this.handleEditAppointment}>
                                    <i className="fas fa-edit" />
                                </button>
                            }
                        </div>
                    </div>
            </div>
        );
    }
}
export { AppointmentCard };