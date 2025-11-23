import { apiRequest } from "../../config/api";

export const addAppointmentAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "appointments/addAppointment",
        body: data
    })
}

export const updateAppointment = async (data) => {
    return await updateDoc({ collection: "agendamentos", data: data })
}

export const getAppointment = async (id) => {
    return await getDoc({
         collection: "agendamentos" ,
         queries: [
            where("estabelecimentoId", "==", id)
        ]
    })
}

export const getAppointmentByProviderAndDateAPI = async (providerId, startDate, endDate) => {
    return await apiRequest({
        method: "POST",
        route: "appointments/getAppointmentByProviderAndDate",
        body: {
            providerId,
            startDate,
            endDate
        }
    })
}

export const getAppointmentsByDateAPI = async (establishmentId, startDate, endDate) => {
    return await apiRequest({
        method: "POST",
        route: "appointments/getAppointmentsByDate",
        body: {
            establishmentId,
            startDate,
            endDate
        }
    })
}