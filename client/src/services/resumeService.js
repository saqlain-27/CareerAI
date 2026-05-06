import api from './api';

export const uploadResume = async (file, jobDescription) => {
    try {
        const formData = new FormData();
        formData.append('resume', file);
        if (jobDescription && jobDescription.trim() !== '') {
            formData.append('jobDescription', jobDescription);
        }

        const response = await api.post(`/resume/analyze`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to upload and analyze resume');
    }
};

export const getResumeHistory = async () => {
    try {
        const response = await api.get(`/resume/history`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch resume history');
    }
};

export const getResumeAnalysis = async (id) => {
    try {
        const response = await api.get(`/resume/history/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch resume analysis details');
    }
};

export const deleteResumeAnalysis = async (id) => {
    try {
        const response = await api.delete(`/resume/history/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete resume analysis');
    }
};
