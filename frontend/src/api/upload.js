import api from './api'

export const uploadAudio = (file,name) => {
    return api.get('/audio',{file,name})
}
