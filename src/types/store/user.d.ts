declare namespace TopHap {
  interface Customer {
    id: string
    sources: {
      data: any[]
      [extra: string]: any
    }
    [extra: string]: any
  }

  export type UserRole = 'free' | 'pro' | 'advanced' | 'enterprise'
  interface Payment {
    customer: string | null
    plan: string | null
    role: UserRole
    period: { end: number; start: number } | null
    subscription: string | null
    trial_end?: number
  }

  export interface UserState {
    isAnonymous: boolean | undefined
    uid: string | undefined
    providerId: string
    info: {
      uid?: string
      username?: string
      type?: string
      visible?: boolean
      displayName?: string
      photoUrl?: string
      email?: string
      emailVerified?: boolean
      phoneNumber?: string
      userSince?: number
      isAnonymous?: boolean
      favorite?: string[]
      likes?: string[]
      licenseNumber?: string
      unsubscribed?: boolean
    }
    geoInfo: object
    paymentInfo?: Payment
    history: string[]
    recent: {
      searches: Place[]
      views: Place[]
    }
    customer?: Customer
    invoices: {
      upcoming: any
      items: any[]
      hasMore: boolean
    }
  }

  export interface UserCreators {
    createCustomer(payload: any): AnyAction
    updateCustomer(payload: any): AnyAction
    createSubscription(plan: string): AnyAction
    updateSubscription(plan?: string): AnyAction
    deleteSubscription(): AnyAction
    getCurrentUserInfo(): AnyAction
    getCustomer(): AnyAction
    getRecentSearches(): AnyAction
    updatePassword(oldPassword: string, newPassword: string): AnyAction
    updateUser(): AnyAction
    updateStates(payload: any): AnyAction
    addRecentSearch(place: TopHap.Place): AnyAction
    addRecentView(id: string): AnyAction
    addCoupon(coupon: string): AnyAction
    deleteSource(source: string): AnyAction
    getInvoices(after: string, limit?: number): AnyAction
    getUpcomingInvoice(): AnyAction
    sendFeedback(payload: TopHap.Service.SendFeedbackRequest): AnyAction
    routeChanged(url: string): AnyAction
    signOut(): AnyAction
  }
}
