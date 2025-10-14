import React from "react";
import { NavBar } from "../../components/navbar"
import { TimeInput } from "../../shared/utils";
import { getEstabelecimento, setHorarios, getHorarios } from "../../config/auth";
import { getOpeningHours, addOpeningHours, updateOpeningHours } from "../../store/collections/openingHoursWorker";
import { isEmpty } from "../../shared/utils";
import { isValidMinutes } from "../../services/appointment/appointmentService";

class OpeningHours extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            establishment: getEstabelecimento(),
            horariosId: "",
            horarios: [
                { dia: "Domingo", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 0 },
                { dia: "Segunda-feira", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 1 },
                { dia: "Terça-feira", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 2 },
                { dia: "Quarta-feira", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 3 },
                { dia: "Quinta-feira", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 4 },
                { dia: "Sexta-feira", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 5 },
                { dia: "Sabado", horarioInicio: "00:00", horarioFim: "00:00", status: "active", day: 6 },
            ],
        }
    }

    componentDidMount() {
        this.load()
    }

    load = async () => {
        try {
            console.log('Carregando horários para establishment:', this.state.establishment.id)
            const horarios = await getOpeningHours(this.state.establishment.id)
            console.log('Horários retornados do banco:', horarios)
            
            if (horarios && horarios.length > 0 && horarios[0].horarios) {
                console.log('Carregando horários salvos:', horarios[0].horarios)
                this.setState({ 
                    horarios: horarios[0].horarios, 
                    horariosId: horarios[0].id 
                })
            } else {
                console.log('Nenhum horário encontrado, mantendo padrão')
            }
        } catch (error) {
            console.error('Erro ao carregar horários:', error)
            // Manter os horários padrão em caso de erro
        }
    }

    handleChangeStatus = (index) => {
        const newHorarios = [...this.state.horarios]
        newHorarios[index].status = newHorarios[index].status === "active" ? "inactive" : "active"
        this.setState({ horarios: newHorarios })
    }

    handleChangeHorario = (e, index, field) => {
        const newHorarios = [...this.state.horarios]
        newHorarios[index][field] = e.target.value
        this.setState({ horarios: newHorarios })
    }

    getStatus = (index) => {
        if (!this.state.horarios || !this.state.horarios[index]) {
            return false
        }
        return this.state.horarios[index].status === "active"
    }

    save = async () => {
        try {
            console.log('Iniciando salvamento dos horários...')
            console.log('Establishment ID:', this.state.establishment.id)
        const data = {
                establishmentId: this.state.establishment.id,
                horarios: this.state.horarios
        }
            console.log('Dados a serem salvos:', data)
            
        if (this.verifyFields(data)) {
                console.log('Validação passou, salvando...')
                if (this.state.horariosId) {
                    console.log('Atualizando horários existentes...')
                    const updateData = { id: this.state.horariosId, ...data }
                    await updateOpeningHours(updateData)
                } else {
                    console.log('Criando novos horários...')
                    const result = await addOpeningHours(data)
                    console.log('Resultado da criação:', result)
                    if (result && result.id) {
                        this.setState({ horariosId: result.id })
                        console.log('ID do horário salvo:', result.id)
                    } else {
                        console.error('Erro: ID não retornado após criação')
                    }
                }
                setHorarios(data)
                alert("Horários salvos com sucesso!")
                } else {
                console.log('Validação falhou')
                }
            } catch (error) {
            console.error('Erro ao salvar horários:', error)
            alert("Erro ao salvar horários. Tente novamente.")
        }
    }

    verifyFields = (data) => {
        console.log('Verificando campos:', data)
        
        if (!data || !data.horarios || !Array.isArray(data.horarios)) {
            console.log('Dados inválidos:', data)
            alert("Dados de horários inválidos.")
            return false
        }
        
        // Verificar se pelo menos um dia está ativo
        const hasActiveDay = data.horarios.some(horario => horario.status === "active")
        if (!hasActiveDay) {
            alert("Selecione pelo menos um dia da semana para funcionar.")
            return false
        }
        
        for (let i = 0; i < data.horarios.length; i++) {
            const horario = data.horarios[i]
            if (!horario) continue
            
            // Só validar se o dia estiver ativo
            if (horario.status === "active") {
                if (isEmpty(horario.horarioInicio) || isEmpty(horario.horarioFim)) {
                    alert(`Preencha o horário de início e fim para ${horario.dia}.`)
                return false
            }
                if (horario.horarioInicio >= horario.horarioFim) {
                    alert(`O horário de início deve ser menor que o horário de fim para ${horario.dia}.`)
                return false
            }
                if (!isValidMinutes(horario.horarioInicio) || !isValidMinutes(horario.horarioFim)) {
                    alert(`Horários inválidos para ${horario.dia}.`)
                return false
            }
        }
        }
        console.log('Validação passou')
        return true
    }

    renderDayCard = (dayIndex, dayName, icon) => {
        return (
            <div className="col-12" key={dayIndex}>
                <div className="card border-0 shadow-sm" style={{ 
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-secondary)'
                }}>
                    <div className="card-body p-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div className="form-check form-switch me-3">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id={`switch-${dayName.toLowerCase()}`} 
                                        checked={this.getStatus(dayIndex)} 
                                        onChange={() => this.handleChangeStatus(dayIndex)}
                                    />
                                </div>
                                <div style={{ 
                                    fontSize: 'var(--font-size-lg)', 
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--text-primary)',
                                    minWidth: '120px'
                                }}>
                                    <i className={`fas ${icon} me-2`}></i>
                                    {dayName}
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div>
                                    <label style={{ 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: 'var(--text-tertiary)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        Início
                                    </label>
                                    <TimeInput 
                                        value={this.state.horarios[dayIndex].horarioInicio} 
                                        disabled={!this.getStatus(dayIndex)}
                                        onChange={(e) => this.handleChangeHorario(e, dayIndex, "horarioInicio")} 
                                        style={{
                                            width: '100px',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: 'var(--text-tertiary)',
                                        fontWeight: 'var(--font-weight-medium)',
                                        marginBottom: 'var(--spacing-xs)'
                                    }}>
                                        Fim
                                    </label>
                                    <TimeInput 
                                        value={this.state.horarios[dayIndex].horarioFim} 
                                        disabled={!this.getStatus(dayIndex)}
                                        onChange={(e) => this.handleChangeHorario(e, dayIndex, "horarioFim")} 
                                        style={{
                                            width: '100px',
                                            textAlign: 'center'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <>
                <NavBar/>
                <div className="d-flex justify-content-center py-5">
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
                                <i className="fas fa-clock me-2"></i>
                                Configurar Horários de Funcionamento
                            </h4>
                                </div>
                        
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    fontSize: 'var(--font-size-sm)',
                                    margin: 0
                                }}>
                                    Configure os horários de funcionamento para cada dia da semana
                                </p>
                            </div>
                            
                            <div className="row g-3">
                                {this.renderDayCard(0, "Domingo", "fa-calendar-day")}
                                {this.renderDayCard(1, "Segunda-feira", "fa-calendar-day")}
                                {this.renderDayCard(2, "Terça-feira", "fa-calendar-day")}
                                {this.renderDayCard(3, "Quarta-feira", "fa-calendar-day")}
                                {this.renderDayCard(4, "Quinta-feira", "fa-calendar-day")}
                                {this.renderDayCard(5, "Sexta-feira", "fa-calendar-day")}
                                {this.renderDayCard(6, "Sábado", "fa-calendar-day")}
                                </div>
                            
                            <div className="d-flex justify-content-center gap-3 mt-4">
                                <button className="btn btn-primary btn-lg" 
                                        onClick={this.save}
                                        style={{
                                            padding: 'var(--spacing-md) var(--spacing-xl)',
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-lg)',
                                            minWidth: '200px'
                                        }}>
                                    <i className="fas fa-save me-2"></i>
                                    Salvar Horários
                                </button>
                                
                                <button className="btn btn-outline-secondary btn-lg" 
                                        onClick={() => {
                                            console.log('Estado atual:', this.state)
                                            console.log('Horários:', this.state.horarios)
                                        }}
                                        style={{
                                            padding: 'var(--spacing-md) var(--spacing-xl)',
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-lg)',
                                            minWidth: '200px'
                                        }}>
                                    <i className="fas fa-bug me-2"></i>
                                    Debug Estado
                                </button>
                                
                                <button className="btn btn-outline-info btn-lg" 
                                        onClick={() => {
                                            console.log('Recarregando horários...')
                                            this.load()
                                        }}
                                        style={{
                                            padding: 'var(--spacing-md) var(--spacing-xl)',
                                            fontSize: 'var(--font-size-lg)',
                                            fontWeight: 'var(--font-weight-semibold)',
                                            borderRadius: 'var(--radius-lg)',
                                            minWidth: '200px'
                                        }}>
                                    <i className="fas fa-sync me-2"></i>
                                    Recarregar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export { OpeningHours }