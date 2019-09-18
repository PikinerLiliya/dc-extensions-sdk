import { ClientConnection, MIO_EVENTS } from 'message.io';
import { ContentItem } from './ContentItem';
import { ContentType } from './models/ContentType';
import { Field, FieldSchema } from './Field';
import { Frame } from './Frame';
import { CONTEXT } from './Events';
import { MediaLink } from './MediaLink';
import { ContentLink } from './ContentLink';
import { LocalesModel } from './models/Locales';
import { ERRORS_INIT } from './Errors';
/**
 * Expected format for the provided options
 */
export interface OptionsObject {
  window?: Window;
  connectionTimeout?: number;
  debug?: boolean;
}
export interface Options {
  window: Window;
  connectionTimeout: number;
  debug: boolean;
}
export interface StagingEnvironment {
  domain: string;
  src: string;
}
export interface Params {
  instance: object;
  installation: object;
}

type ContextObject<ParamType> = {
  contentItemId: string;
  contentType: ContentType;
  fieldSchema: FieldSchema;
  params: ParamType;
  locales: LocalesModel;
  stagingEnvironment: StagingEnvironment;
  visualisation: string;
};

export class SDK<FieldType = any, ParamType extends Params = Params> {
  /**
   * message.io [[ClientConnection]] instance. Use to listen to any of the message.io lifecycle events.
   */
  public connection!: ClientConnection;
  /**
   * Content Item - The model of the Content Item that is being edited.
   */
  public contentItem!: ContentItem;
  /**
   * Content Type - The JSON Schema of the Content Item that is being edited.
   */
  public contentType!: ContentType;
  /**
   * Field - Allows you to get and set the value of the field the extension is control of.
   */
  public field!: Field<FieldType>;
  /**
   * Frame - Use to control the height sizing behaviour of your extension.
   */
  public frame!: Frame;
  /**
   * Params - optional paramaters for your extension.
   */
  public params!: ParamType;
  /**
   * Locales - The locales you currently have available.
   */
  public locales!: LocalesModel;
  /**
   * Content Link - Use to open a content browser.
   */
  public contentLink: ContentLink;
  /**
   * Media Link - Use to open a media browser.
   */
  public mediaLink: MediaLink;
  /**
   * stagingEnvironment - Used for accessing staged assets.
   */
  public stagingEnvironment!: StagingEnvironment;
  /**
   * Visualisation - URL of the visualisation
   */
  public visualisation!: string;
  protected options: Options;
  protected readonly defaultOptions: Options = {
    window: window,
    connectionTimeout: 1000,
    debug: false
  };

  /**
   * The SDK instance is the central place for all SDK methods. It takes an optional options object.
   * @param options
   */
  constructor(options: OptionsObject = {}) {
    this.options = { ...this.defaultOptions, ...options };
    this.connection = new ClientConnection(this.options);
    this.mediaLink = new MediaLink(this.connection);
    this.contentLink = new ContentLink(this.connection);
    this.frame = new Frame(this.connection, this.options.window);
  }

  /**
   * Initialiser. Returns a promise that resolves to an instance of the SDK.
   */
  public async init(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.connection.init();
      this.connection.on(MIO_EVENTS.CONNECTED, async () => {
        try {
          await this.setupContext(resolve, reject);
          resolve(this);
        } catch (e) {
          reject(new Error(ERRORS_INIT.CONTEXT));
        }
      });
      this.connection.on(MIO_EVENTS.CONNECTION_TIMEOUT, () => {
        reject(new Error(ERRORS_INIT.CONNTECTION_TIMEOUT));
      });
    });
  }

  private async setupContext(resolve: Function, reject: Function) {
    const {
      contentItemId,
      contentType,
      fieldSchema,
      params,
      locales,
      stagingEnvironment,
      visualisation
    } = await this.requestContext();
    this.contentItem = new ContentItem(this.connection, contentItemId);
    this.field = new Field(this.connection, fieldSchema);
    this.contentType = contentType;
    this.params = params;
    this.locales = locales;
    this.visualisation = visualisation;
    this.stagingEnvironment = stagingEnvironment;
  }

  private async requestContext(): Promise<ContextObject<ParamType>> {
    return this.connection.request(CONTEXT.GET);
  }
}
