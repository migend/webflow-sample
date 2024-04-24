export const createJob = async (
  projectUid: string,
  targetLangs: string[],
  payload?: any,
  region = 'EU'
): Promise<CreateJobResponse> => {
  const headers = new AxiosHeaders()
  headers.set('Content-Disposition', `filename*=UTF-8''file.json`)
  headers.set('Memsource', `{targetLangs:${JSON.stringify(targetLangs)}}`)
  headers.set('Content-Type', 'application/octet-stream')

  const { data } =
    (await requestClient.post<CreateJobResponse>(
      '/proxy-tms', payload, {
        headers,
        params: {
          httpMethod: 'POST',
          endpoint: `/web/api2/v1/projects/${projectUid}/jobs`,
          region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
      }}
    )) ?? {}

  return data
}

export const listJobs = async (
  projectUid: string,
  params?: Record<string, string>,
  region = 'EU'
): Promise<ListJobsResponse> => {
  const { data } =
    (await requestClient.post<ListJobsResponse>('/proxy-tms', {}, {
      params: {
        endpoint: `/web/api2/v2/projects/${projectUid}/jobs`,
        httpMethod: 'GET',
        region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
        ...params
      }
    })) ?? {}

  return data
}

export const getJob = async (projectUid: string, jobUid: string, region = 'EU'): Promise<GetJobResponse> => {
  const { data } =
    (await requestClient.post<GetJobResponse>(
      '/proxy-tms', {}, {
        params: {
          endpoint: `/web/api2/v1/projects/${projectUid}/jobs/${jobUid}`,
          httpMethod: 'GET',
          region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
      }}
    )) ?? {}

  return data
}

export const downloadTargetFile = async (projectUid: string, jobUid: string, region = 'EU'): Promise<Blob> => {
  const {
    data: {
      asyncRequest: { id }
    }
  } =
    (await requestClient.post<AsyncRequestResponse>(
      '/proxy-tms', {}, {
        params: {
          endpoint: `/web/api2/v2/projects/${projectUid}/jobs/${jobUid}/targetFile`,
          httpMethod: 'PUT',
          region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
      }}
    )) ?? {}

  const { data } =
    (await requestClient.post<any>(
      '/proxy-tms', {},
      {
        'axios-retry': {
          retryDelay: () => 1000,
          onRetry(retryCount, error, requestConfig) {
              console.log('retrying..', retryCount)
          },
        },
        responseType: 'json',
        params: {
          endpoint: `/web/api2/v2/projects/${projectUid}/jobs/${jobUid}/downloadTargetFile/${id}`,
          httpMethod: 'GET',
          region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
        }
      }
    )) ?? {}

  return data
}

export const createProject = async (
  payload: CreateProjectPayload, region = 'EU'
): Promise<CreateProjectResponse> => {
  const { data } =
    (await requestClient.post<CreateProjectResponse>('/proxy-tms', payload, {
      params: {
        endpoint: `/web/api2/v3/projects`,
        httpMethod: 'POST',
        region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
    }})) ?? {}
  return data
}

export const createProjectFromTemplate = async (
  templateUid: string,
  payload: CreateProjectFromTemplatePayload,
  region = 'EU'
): Promise<CreateProjectFromTemplateResponse> => {
  const { data } =
    (await requestClient.post<CreateProjectFromTemplateResponse>(
      '/proxy-tms', payload,
      {
        params: {
          endpoint: `/web/api2/v2/projects/applyTemplate/${templateUid}`,
          httpMethod: 'POST',
          region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
      }}
    )) ?? {}
  return data
}

export const listProjectTemplates = async (
  params?: Record<string, any>,
  region = 'EU'
): Promise<ListProjectTemplatesResponse> => {
  const { data } =
    (await requestClient.post<ListProjectTemplatesResponse>('/proxy-tms', {}, {
      params: {
        endpoint: `/web/api2/v1/projectTemplates`,
        httpMethod: 'GET',
        region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
        ...params
      }
    })) ?? {}
  return data
}

export const listProjects = async (params?: Record<string, any>, region = 'EU'): Promise<ListProjectsResponse> => {
  const { data } =
    (await requestClient.post<ListProjectsResponse>('/proxy-tms', {}, {
      params: {
        endpoint: `/web/api2/v1/projects`,
        httpMethod: 'GET',
        region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
        ...params
      }
    })) ?? {}
  return data
}

export const getProject = async (projectUid: string, region = 'EU'): Promise<GetProjectResponse> => {
  const { data } =
    (await requestClient.post<GetProjectResponse>('/proxy-tms', {}, {
      params: {
        endpoint: `/web/api2/v1/projects/${projectUid}`,
        httpMethod: 'GET',
        region: import.meta.env.DEV ? import.meta.env.VITE_REGION : region,
    }})) ?? {}

  return data
}