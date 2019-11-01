export enum ERRORS_INIT {
  /**
   * We failed to fetch all the necessary data for displaying a custom control
   */
  CONTEXT = 'Failed to fetch context for UI Extension',
  /**
   * Extension failed to connect to Dynamic content
   */
  CONNTECTION_TIMEOUT = 'Failed to establish connection to DC Application'
}

export enum ERRORS_CONTENT_ITEM {
  /**
   * Must supply content type ids in order to fetch a content item/reference
   */
  NO_IDS = 'Please provide content type ids'
}

export enum ERRORS_FRAME {
  /**
   * Must supply a number or nothing, this normally means you've provided a type setHeight can't handle
   */
  SET_HEIGHT_NUMBER = 'setHeight() only accepts an optional number argument'
}

export enum FORM {
  /**
   * This normally means you're in a context where their is no model to return i.e Schema Editor
   */
  NO_MODEL = 'Unable to retrieve form model as form context does not have an active model.'
}
