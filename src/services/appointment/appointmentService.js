import { getAppointmentByProviderAndDate } from '../../store/collections/appointmentWorker';
import { isEmpty, convertTimeToMinutes, secondsToDate } from '../../shared/utils';
import { getDay } from "date-fns";

export const setDaysAllowed = (data) => {
    const horarios = data.horarios
    var daysAllowed = []
    for (let i = 0; i < horarios.length; i++) {
      if (horarios[i].status === "active") {
        daysAllowed.push(horarios[i].day)
      }
    }
    return daysAllowed
}

export const getAvailableHours = (selectedDate, data) => {
    const dataBase = '2024-01-01'
    const diaDaSemana = selectedDate.getDay()
    const horarioDoDia = data.horarios[diaDaSemana]
    if (!horarioDoDia || horarioDoDia.status !== "active") {
      return ["inactive"]
    }
    const { horarioInicio: inicio, horarioFim: fim } = horarioDoDia
    const blocos = []
    const inicioDate = new Date(`${dataBase}T${inicio}:00`)
    if (inicioDate.getMinutes() > 0) {
      inicioDate.setHours(inicioDate.getHours() + 1)
      inicioDate.setMinutes(0)
    }
    const fimDate = new Date(`${dataBase}T${fim}:00`)
    fimDate.setMinutes(0)
    let atual = new Date(inicioDate)
    while ((fimDate - atual) >= 60 * 60 * 1000) {
      const horas = atual.getHours().toString().padStart(2, '0')
      const minutos = atual.getMinutes().toString().padStart(2, '0')
      blocos.push(`${horas}:${minutos}`)
      atual.setHours(atual.getHours() + 1)
    }
    return blocos
  }

export const isValidMinutes = (hour) => {
    const [hh, mm] = hour.split(":").map(Number)
    if (mm > 59) {
        alert("minutos inválidos")
        return false
    }
    var time = hh * 60 + mm
    if (Number.isNaN(time)) {
        return false
    }
    return true
}

export const getNext7Days = () => {
    const today = new Date()
    const next7Days = []
    for (var i = 0; i < 7; i++) {
        const nextDay = new Date(today)
        nextDay.setDate(today.getDate() + i)
        next7Days.push({
            date: nextDay, 
            dayOfWeek: nextDay.getDay()
        })
    }
    return next7Days
}

export const completeAvailableHours = (horarios) => {
    if (!horarios || !horarios.horarios) {
        return []
    }
    
    const next7Days = getNext7Days()
    const completed = next7Days.map((day) => {
        const horarioDoDia = horarios.horarios[getDay(day.date)]
        if (!horarioDoDia || horarioDoDia.status !== "active") {
            return { ...day, isDayAllowed: false, availableHours: [], dia: horarioDoDia?.dia || null}
        }
        const availableHours = getAvailableHours(day.date, horarios)
        return { ...day, isDayAllowed: true, availableHours: availableHours, dia: horarioDoDia?.dia || null }
    })
    return completed
}

export const isPastDateTime = (dateInfo) => {
    if (!dateInfo?.date?.seconds || !dateInfo?.hour) return false
    const baseDate = new Date(dateInfo.date.seconds * 1000)
    const hoursArray = Array.isArray(dateInfo.hour) ? dateInfo.hour : [dateInfo.hour]
    const lastHour = hoursArray[hoursArray.length - 1]
    const [h, m] = lastHour.split(':').map(Number)
    baseDate.setHours(h, m, 0, 0)
    const diffInMs = Date.now() - baseDate.getTime()
    return diffInMs >= 3600000
}

export const groupAgendamentosByDayOfWeek = (agendamentos) => {
    if (!Array.isArray(agendamentos)) return []

    const getTimestamp = (item) => {
        const segundos = item?.dateInfo?.date?.seconds || 0
        const horas = item?.dateInfo?.hour
        const horaStr = Array.isArray(horas) ? horas[0] : horas || "00:00"
        const [h, m] = horaStr.split(":").map(Number)
        return (segundos * 1000) + (h * 3600000) + (m * 60000)
    }

    const ordenados = [...agendamentos].sort((a, b) => getTimestamp(a) - getTimestamp(b))

    const agrupadosObj = {}
    ordenados.forEach(item => {
        const dia = item?.dateInfo?.titleDayOfWeek
        const indexDayOfWeek = item?.dateInfo?.indexDayOfWeek
        if (!dia) return
        if (!agrupadosObj[dia]) {
        agrupadosObj[dia] = {
            indexDayOfWeek,
            agendamentos: []
        }
        }
        agrupadosObj[dia].agendamentos.push(item)
    })

    const agrupadosArray = Object.entries(agrupadosObj).map(([day, obj]) => ({
        day,
        indexDayOfWeek: obj.indexDayOfWeek,
        agendamentos: obj.agendamentos
    }))

    return agrupadosArray
}

export const setAvailableHours = async (providersIds, day, originalHourSelected = []) => {
    var date = day
    if (date.date?.seconds) {
        date = secondsToDate(date.date.seconds)
    } else {
        date = date.date
    }
    const appointmentsByProviderAndDate = await getAppointmentByProviderAndDate([providersIds], date, date)
    const bookedHours = appointmentsByProviderAndDate.map(a => a.dateInfo.hour).flat()
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    var hoursBeforeNow = []
    
    if (isToday) {
        hoursBeforeNow = day.availableHours.map(hour => {
            const [h, m] = hour.split(':').map(Number)
            var appointmentDate = new Date()
            appointmentDate.setHours(h, m, 0, 0)
            if (appointmentDate < now) {
                return hour
            }
        })
    }

    if (day.availableHours.length > 0) {
        var availableHoursWithStatus = day.availableHours.map(hour => ({
            hour,
            available: (hoursBeforeNow.includes(hour) || bookedHours.includes(hour)) ? false : true,
            isEditing: bookedHours.includes(hour) && originalHourSelected.includes(hour)
        }))
    }
    return availableHoursWithStatus
}

export const hourStillAvailable = async (availableHours, hours) => {
    if (availableHours.length === 0 || hours.length === 0) return false

    return hours.some(h =>
        availableHours.some(ah => ah.hour === h && (ah.available || ah.isEditing))
    )
}

export const verifyServiceTimeInBlocks = (service) => {
    return Math.ceil(convertTimeToMinutes(service.duracao) / 60)
}

export const groupByProviderAndDate = (allAppointments) => {
    const providers = allAppointments.reduce((acc, appointment) => {
        const providerId = appointment.provider.id
        const providerName = appointment.provider.nome
        const dateKey = appointment.dateInfo.date.seconds
        const titleDayOfWeek = appointment.dateInfo.titleDayOfWeek

        var provider = acc.find(p => p.id === providerId)
        if (!provider) {
            provider = { id: providerId, nome: providerName, dates: [] }
            acc.push(provider)
        }

        var dateGroup = provider.dates.find(d => d.date === dateKey)
        if (!dateGroup) {
            dateGroup = { date: dateKey, appointments: [], titleDayOfWeek }
            provider.dates.push(dateGroup)
        }
        
        dateGroup.appointments.push(appointment)
        return acc
    }, [])

    const sortedProviders = providers.map(provider => {
        const sortedDates = provider.dates.map(d => ({...d,appointments: d.appointments.sort((a, b) => a.dateInfo.hour[0].localeCompare(b.dateInfo.hour[0]))})).sort((a, b) => a.date - b.date)
        return {
            ...provider,
            dates: sortedDates
        }
    })

    return sortedProviders
}