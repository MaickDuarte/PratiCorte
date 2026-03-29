import { addDoc, getAllDocs, updateDoc, deleteDoc } from "./collectionBaseWorker";
import { apiRequest } from "../../config/api";

export const addServiceAPI = async (data) => {
    console.log(data)
    return await apiRequest({
        method: "POST",
        route: "services/addService",
        body: data
    })
}

export const updateServiceAPI = async (data) => {
    return await apiRequest({
        method: "POST",
        route: "services/updateService",
        body: data
    })
}



export const getServicesAPI = async (id) => {
    console.log(id)
    return await apiRequest({
        method: "POST",
        route: "services/getServices",
        body: {
            id,
        }
    })
}

export const deleteServiceAPI = async (data) => {
    console.log(data)
    return await apiRequest({
        method: "POST",
        route: "services/deleteService",
        body: data
    })
}