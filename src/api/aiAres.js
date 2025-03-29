import api from "./axios"

const aiAnalysisRes = (id) => {
    return api.get(`/api/ai_analysis_results/${id}`)
}

const aiAnalysisResUserId = (user_id) => {
    return api.get(`/api/ai_analysis_results/user/${user_id}`)
}


const aiAnalysis = (AiContent) => {
    return api.post('/api/ai_analysis', {
        "user_id": AiContent.user_id,
        "prompt": AiContent.prompt        
    })
}

export {aiAnalysis, aiAnalysisResUserId, aiAnalysisRes}