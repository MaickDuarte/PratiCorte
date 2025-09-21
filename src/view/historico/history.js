import React from "react";
import { NavBar } from "../../components/navbar";
import { getEstabelecimento } from "../../config/auth";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Portuguese } from "flatpickr/dist/l10n/pt.js";

class History extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            establishment: getEstabelecimento(),
            providers: [],
            startDate: new Date(),
            endDate: new Date(),
            allAppointments: [],
            filteredAppointments: []
        }
    }

    componentDidMount() {
        this.applyFilter()
    }

    applyFilter = () => {
    }

    groupByProviderAndDate = () => {
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
                    </div>
                </div>
            </>
        )
    }
}

export { History }