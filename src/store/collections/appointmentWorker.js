import { addDoc, getDoc, updateDoc, getAllDocs } from "./collectionBaseWorker";
import { startOfDay, endOfDay } from 'date-fns';
import { where } from "firebase/firestore"

export const addAppointment = async (data) => {
    return await addDoc({ collection: "agendamentos", data: data })
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

export const getAppointmentByProviderAndDate = async (providersIds, startDate, endDate) => {
    return await getAllDocs({
        collection: "agendamentos",
        queries: [
            where("provider.id", "in", providersIds),
            where("dateInfo.date", ">=", startOfDay(startDate)),
            where("dateInfo.date", "<=", endOfDay(endDate))
        ]
    })
}

export const getAppointmentsByDate = async (establishmentId, startDate, endDate) => {
    return await getAllDocs({
        collection: "agendamentos",
        queries: [
            where("estabelecimentoId", "==", establishmentId),
            where("dateInfo.date", ">=", startOfDay(startDate)),
            where("dateInfo.date", "<=", endOfDay(endDate))
        ]
    })
}