import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { getUserByEmailAPI } from "../store/collections/userWorker";
import { getEstablishmentByUser } from "../store/collections/establishmentWorker";
import { getOpeningHoursAPI } from "../store/collections/openingHoursWorker";

export const handleLogin = async (email, password, setLoading) => {
    setLoading(true)
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = await getUserByEmailAPI(userCredential.user.email)
        const establishment = await getEstablishmentByUser(user)
        const horarios = await getOpeningHoursAPI(establishment.id)
        setSessao({ usuario: user, estabelecimento: establishment, horarios: horarios })
        window.location.href = "/home"
    } catch (error) {
        let errorMessage = error.message

        if (errorMessage === "Firebase: Error (auth/invalid-credential).") {
            errorMessage = "Email ou senha inválidos, tente novamente"
        }
        alert(`Erro no login: ${errorMessage}`);
        setLoading(false)
    }
}

export const handleLogout = async () => {
    try {
        await signOut(auth);    
        localStorage.removeItem('sessao')
        window.location.href = "/";
    } catch (error) {
        console.error("Erro ao deslogar:", error.message);
        alert(`Erro ao deslogar: ${error.message}`);
    }
}

export const checkUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const user = auth.currentUser
    if (user) {
        window.location.href = "/home"
    } 
}

export const setSessao = (sessao) => {
    localStorage.setItem('sessao', JSON.stringify(sessao))
}

export const getSessao = () => {
    const sessao = localStorage.getItem('sessao')
    return sessao ? JSON.parse(sessao) : null
}

export const setEstabelecimento = (estabelecimento) => {
    const sessao = getSessao()
    if (sessao !== null) {
        sessao.estabelecimento = estabelecimento
        setSessao(sessao)
    }
}

export const getEstabelecimento = () => {
    const sessao = getSessao()
    return sessao ? sessao.estabelecimento : null
}

export const setUsuario = (usuario) => {
    const sessao = getSessao()
    if (sessao !== null) {
        sessao.usuario = usuario
        setSessao(sessao)
    }
}

export const getUsuario = () => {
    const sessao = getSessao()
    return sessao ? sessao.usuario : null
}

export const setHorarios = (horarios) => {
    const sessao = getSessao()
    if (sessao !== null) {
        sessao.horarios = horarios
        setSessao(sessao)
    }
}

export const getHorarios = () => {
    const sessao = getSessao()
    return sessao ? sessao.horarios : null
}