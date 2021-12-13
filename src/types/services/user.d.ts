declare namespace TopHap {
  export namespace Service {
    export type SendFeedbackRequest = {
      from?: string
      subject?: string
      payload: {
        [extra: string]: any
      }
    }
  }
}
