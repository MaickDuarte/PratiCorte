import { addDoc, getDoc, updateDoc, getAllDocs } from "./collectionBaseWorker";
import { where } from "firebase/firestore"

export const addOpeningHours = async (data) => {
    return await addDoc({ collection: "openingHours", data: data })
}

export const updateOpeningHours = async (data) => {
    return await updateDoc({ collection: "openingHours", data: data })
}

export const getOpeningHours = async (id) => {
    return await getAllDocs({
         collection: "openingHours" ,
         queries: [
            where("estabelecimentoId", "==", id)
        ]
    })
}