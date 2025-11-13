import type { APIBase } from '~/services/theway/base';
import type { SelectOption } from '~/components/beskar/types';
import type { LeadSourceTagResource } from './leadSources/types';
import type { TagResource } from './tags/types';
import type { UserResource } from './users/types';
import type { StoreType } from '~/components/filter/types';
import type { ContactResource } from './contacts/types';
import type { CompanyResource } from './companies/types';
import type { AddressResource } from './addresses/types';
import type { TagInput } from './thirdPartyContacts/types';
import type { BusinessUnitResource } from './businessUnits/types';
import type { OktraRole, ProspectResource } from './prospects/types';
import type { LeadResource } from './leadPool/types';
import type { MyCallsResource } from './callLog/types';
import type { EventResource } from './events/types';
import type { NoteResource } from './notes/types';

export type UUID = string;

export interface LooseObject {
    [key: string]: any;
}

export interface ResourceInput {}

export interface Resource {
    readonly id: UUID;
    cindy_id?: string;
    ivy_id?: string;
}

export interface OrganisationalObjectInput extends ResourceInput {
    name: string;
    description: string | null;
}

export interface OrganisationalObject extends Resource {
    readonly name: string;
    readonly description: string | null;
    readonly references?: number | null;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface UserObject extends Resource {}

export interface channelObject extends Resource {
    readonly name: string;
    readonly description?: string | null;
    readonly group?: string;
    readonly references: number;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}
export interface LeadSourceObject extends Resource {
    readonly position: string | null;
    readonly name: Name;
    readonly contact: ContactDetails;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface LeadSourceTypeObject extends Resource {
    readonly name: string;
    readonly description: string | null;
    readonly references: number;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface AddressObject extends Resource {
    readonly floor_number: number | null;
    readonly company: string | null;
    readonly sqft: number | null;
    readonly lookup_id: UUID;
    readonly postal: {
        readonly address_line1: string;
        readonly address_line2: string | null;
        readonly address_line3: string | null;
        readonly city: string;
        readonly county: string | null;
        readonly postcode: string;
        readonly country: string | null;
    };
    readonly contact: ContactDetails | null;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface ContactObject extends Resource {
    readonly name: {
        readonly title: string | null;
        readonly first_name: string;
        readonly last_name: string;
    };
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
    readonly contact: {
        readonly email: string;
        readonly mobile: string;
        readonly ddi: string;
        readonly telephone: string;
        readonly fax: string;
    };
}

export interface ContactOption<ObjType extends ContactObject>
    extends SelectOption {
    readonly object: ObjType;
}
export interface LeadSourceOptions<ObjType extends LeadSourceObject>
    extends SelectOption {
    readonly object: ObjType;
}

export interface LeadSourceTypeOptions<ObjType extends LeadSourceTypeObject>
    extends SelectOption {
    readonly object: ObjType;
}
export interface AddressOptions<ObjType extends AddressObject>
    extends SelectOption {
    readonly object: ObjType;
}

export interface AddressOrganisationalObject extends Resource {
    readonly id: UUID;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface TagResourceOrganisationalOptions<ObjType extends TagResource>
    extends SelectOption {}

export interface OrganisationalOption<ObjType extends OrganisationalObject>
    extends SelectOption {
    readonly object: ObjType;
}
export interface UserOption<ObjType extends UserObject> extends SelectOption {
    readonly object: ObjType;
}

export interface channelOption<ObjType extends channelObject>
    extends SelectOption {
    readonly object: ObjType;
}

export interface AddressOrganisationalOption<
    ObjType extends AddressOrganisationalObject,
> extends SelectOption {
    readonly object: ObjType;
}

export interface ThirdPartyOrganisationalObject extends Resource {
    readonly id: UUID;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface ThirdPartyOrganisationalOption<
    ObjType extends ThirdPartyOrganisationalObject,
> extends SelectOption {
    readonly object: ObjType;
}

export interface UserOrganisationalObject extends Resource {
    readonly id: UUID;
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
}

export interface UserOrganisationalOption<
    ObjType extends UserOrganisationalObject,
> extends SelectOption {
    readonly object: ObjType;
}

export interface APIResponse {
    readonly isError: boolean;
}

export type ResponseObject = {
    data?: object[] | object;
    meta?: object;
};

export type ErrorObject = {
    code: string;
    message: string;
};

export type ValidationErrorHandler = (field: string, errors: string[]) => void;

export type AllValidationErrorHandler = (
    fields: Record<string, string | undefined>,
) => void;

export abstract class ErrorResponse implements APIResponse {
    readonly response: ResponseObject;
    readonly isError: boolean = true;
    private readonly error: ErrorObject;
    validationErrors: any | undefined;
    type?: string;
    duplicates?:
        | ContactDuplicateResource[]
        | SupplierDuplicateResource[]
        | CompanyDuplicateResource[]
        | ThirdPartyDuplicateResource[];

    protected constructor(error: ErrorObject, response: ResponseObject) {
        this.error = error;
    }

    get code(): string {
        return this.error.code;
    }

    get message(): string {
        return this.error.message;
    }

    static makeUnknown(response: ResponseObject): ErrorResponse {
        return this.make(
            {
                code: 'unknownError',
                message: 'An unknown error was encountered',
            },
            response,
        );
    }

    static make(error: ErrorObject, response: ResponseObject): ErrorResponse {
        switch (error.code) {
            case 'validationFailed':
                return this.makeValidationError(error, response);
            case 'duplicateDetected':
                return this.makeDuplicateError(error, response);
            case 'notFound':
                return new NotFoundErrorResponse(error, response);
            default:
                return this.makeGenericError(error, response);
        }
    }

    protected static makeGenericError(
        error: ErrorObject,
        response: ResponseObject,
    ) {
        return new (class extends ErrorResponse {})(error, response);
    }

    protected static makeDuplicateError(
        error: ErrorObject,
        response: ResponseObject,
    ): ValidationErrorResponse {
        let validationErrors = new Map<string, string[]>();

        const { duplicates, type, ...rest } =
            response.data as DuplicateCheckResponse;

        for (let field in rest) {
            validationErrors.set(field, (<LooseObject>response.data)[field]);
        }

        return new DuplicateErrorResponse(
            error,
            response,
            validationErrors,
            type,
            duplicates,
        );
    }

    protected static makeValidationError(
        error: ErrorObject,
        response: ResponseObject,
    ): ValidationErrorResponse {
        let validationErrors = new Map<string, string[]>();

        for (let field in response.data) {
            validationErrors.set(field, (<LooseObject>response.data)[field]);
        }

        return new ValidationErrorResponse(error, response, validationErrors);
    }

    public throw(fatal: boolean): void {
        throw createError<OktraError>({
            data: {
                status: 500,
                title: 'Unknown Error',
                message: 'An unknown error was encountered',
            },
            fatal: fatal,
        });
    }
}

export class NotFoundErrorResponse extends ErrorResponse {
    public override throw(fatal: boolean = false): void {
        throw createError<OktraError>({
            data: {
                status: 404,
                title: 'Resource not found',
                message: 'The requested resource could not be found',
            },
            fatal: fatal,
        });
    }
}

export class ValidationErrorResponse extends ErrorResponse {
    override validationErrors: Map<string, string[]>;

    constructor(
        error: ErrorObject,
        response: ResponseObject,
        validationErrors: Map<string, string[]>,
    ) {
        super(error, response);
        this.validationErrors = validationErrors;
    }

    public hasValidationErrors(key: string): boolean {
        return this.validationErrors.has(key);
    }

    public getValidationErrors(key: string): string[] | undefined {
        return this.validationErrors.get(key);
    }

    public getAllValidationErrors(): Map<string, string[]> {
        return this.validationErrors;
    }

    public override throw(fatal: boolean = false): void {}
}

export class DuplicateErrorResponse extends ErrorResponse {
    override validationErrors: Map<string, string[]>;

    constructor(
        error: ErrorObject,
        response: ResponseObject,
        validationErrors: Map<string, string[]>,
        type?: string,
        duplicates?:
            | ContactDuplicateResource[]
            | SupplierDuplicateResource[]
            | CompanyDuplicateResource[]
            | ThirdPartyDuplicateResource[],
    ) {
        super(error, response);
        this.validationErrors = validationErrors;
        this.type = type;
        this.duplicates = duplicates;
    }

    public hasValidationErrors(key: string): boolean {
        return this.validationErrors.has(key);
    }

    public getValidationErrors(key: string): string[] | undefined {
        return this.validationErrors.get(key);
    }

    public getAllValidationErrors(): Map<string, string[]> {
        return this.validationErrors;
    }

    public override throw(fatal: boolean = false): void {}
}

export class Pagination {
    readonly total: number;
    readonly count: number;
    readonly per_page: number;
    readonly current_page: number;
    readonly total_pages: number;
    readonly links: object;

    constructor(
        total: number,
        count: number,
        per_page: number,
        current_page: number,
        total_pages: number,
        links: object,
    ) {
        this.total = total;
        this.count = count;
        this.per_page = per_page;
        this.current_page = current_page;
        this.total_pages = total_pages;
        this.links = links;
    }
}

export abstract class ResourceResponse<ResType extends Resource>
    implements APIResponse
{
    readonly isError: boolean = false;
}

export abstract class NoIdResourceResponse<ResType> implements APIResponse {
    readonly isError: boolean = false;
}

export class SingleResourceResponse<
    ResType extends Resource,
> extends ResourceResponse<ResType> {
    readonly resource: ResType;
    gross_value: unknown;
    readonly meta?: {
        purchasing_totals?: unknown;
    };

    constructor(resource: ResType, meta?: any) {
        super();
        this.resource = resource;
        this.meta = meta;
    }
}

export class NoIdSingleResourceResponse<
    ResType,
> extends NoIdResourceResponse<ResType> {
    readonly resource: ResType;

    constructor(resource: ResType) {
        super();
        this.resource = resource;
    }
}

export class MultiResourceResponse<
    ResType extends Resource,
> extends ResourceResponse<ResType> {
    readonly resources: Array<ResType>;
    readonly totals: LooseObject | null | undefined;

    constructor(resources: ResType[], totals?: LooseObject) {
        super();
        this.resources = resources;
        this.totals = totals;
    }
}

export class MultiNoIdResourseResponse<
    ResType,
> extends NoIdResourceResponse<ResType> {
    readonly resources: Array<ResType>;
    readonly totals: LooseObject | null | undefined;
    readonly extra: LooseObject | null | undefined;

    constructor(
        resources: ResType[],
        totals: LooseObject,
        extra?: LooseObject,
    ) {
        super();
        this.resources = resources;
        this.totals = totals;
        this.extra = extra;
    }
}

export class PaginatedResourceResponse<
    ResType extends Resource,
> extends MultiResourceResponse<ResType> {
    readonly pagination: Pagination;
    readonly totals: LooseObject | null | undefined;
    readonly extra: LooseObject | null | undefined;
    readonly summary: LooseObject | null | undefined;
    readonly variations_agreed: LooseObject | null | undefined;
    readonly variations_not_agreed: LooseObject | null | undefined;

    constructor(
        resources: ResType[],
        pagination: Pagination,
        totals: LooseObject,
        extra?: LooseObject,
        summary?: LooseObject | null,
        variations_agreed?: LooseObject | null,
        variations_not_agreed?: LooseObject | null,
    ) {
        super(resources);
        this.pagination = pagination;
        this.totals = totals;
        this.extra = extra;
        this.summary = summary;
        this.variations_agreed = variations_agreed;
        this.variations_not_agreed = variations_not_agreed;
    }
}

export type PaginationOptions = {
    page?: number;
    per_page?: number;
};

export type SortingOptions = {
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
};

export interface Repository<ResType extends Resource> {
    /**
     * Create a new instance of the entity the repository represents
     *
     * @param object
     */
    makeEntity(object: LooseObject): ResType;
}

export interface SchedRepository<ResType> {
    makeEntity(data: object): ResType;
}

export abstract class BaseRepository<ResType extends Resource>
    implements Repository<ResType>
{
    protected readonly base: APIBase;

    constructor(base: APIBase) {
        this.base = base;
    }

    abstract makeEntity(object: LooseObject): ResType;

    protected makeRelatedEntity<RelatedType extends Resource>(
        data: LooseObject | string | null,
        repository: Repository<RelatedType>,
    ): UUID | RelatedType | null {
        if (data !== null && data !== undefined) {
            if (typeof data === 'string') {
                return <UUID>data;
            } else if (typeof data === 'object') {
                return repository.makeEntity(data);
            }
        }

        return null;
    }

    protected makeRelatedEntities<RelatedType extends Resource>(
        data: LooseObject[] | string[] | null,
        repository: Repository<RelatedType>,
    ): RelatedType[] | null {
        if (data === null) {
            return null;
        }

        if (Array.isArray(data)) {
            let entities: RelatedType[] = [];

            data.forEach((entity: LooseObject | string | null) => {
                let madeEntity = this.makeRelatedEntity(entity, repository);

                if (madeEntity !== null && typeof madeEntity !== 'string') {
                    entities.push(madeEntity);
                }
            });

            return entities;
        }

        return null;
    }
}

export interface Name {
    readonly title: string | null;
    readonly first_name: string;
    readonly last_name: string;
}

export interface ContactDetails {
    readonly email: string | null;
    readonly mobile: string | null;
    readonly ddi: string | null;
    readonly telephone: string | null;
    readonly fax: string | null;
}

export enum DropdownType {
    ResetValue = 'reset-value',
}

export interface SelectOptionResource {
    readonly id: UUID;
    readonly label: string;
}

export interface LatestActivityType {
    readonly id: UUID;
    readonly action: string;
    readonly target_type: string;
    readonly target_id: UUID;
    readonly message: string;
    readonly lead_id: UUID | null;
    readonly prospect_id: UUID | null;
    readonly high_status: string | null;
    readonly old_values: object;
    readonly new_values: object;
    readonly activityTags: object[];
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
    };
    readonly user: UserResource;
}

export interface LatestActivityResponse {
    created: LatestActivityType;
    updated: LatestActivityType;
    viewed: LatestActivityType;
}

export interface ForensicsResponse {
    SiteVisitList: ForensicsResource[];
    CurrentPage: number;
    PageCount: number;
    PageSize: number;
    RecordCount: number;
}

export interface ForensicsResource extends Resource {
    BusinessID: number;
    Duration: number | null;
    EndDateTime: string;
    Keywords: string;
    Multi: number;
    Pages: number;
    ReferrerLink: string;
    ReferrerName: string;
    StartDateTime: string;
    VisitID: number;
}

export interface ForensicsBusiness extends Resource {
    BusinessID: number;
    Name: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    Locality: string;
    Town: string;
    County: string;
    PostCode: string;
    Country: string;
    Telephone: string;
    Website: string;
    Industry: string;
    SICCode: string;
    Turnover: string;
    RegistrationNumber: string;
    EmployeeNumber: string;
    HotScore: number;
    VisitorType: string;
}

export type FilterInput = {
    key: string;
    label: string;
    type:
        | 'text'
        | 'checkbox'
        | 'radio'
        | 'select'
        | 'select-multiple'
        | 'select-search'
        | 'select-tags'
        | 'date'
        | 'range';
    hint?: string;
    placeholder?: string;
    storeType?: StoreType;
    searchable?: boolean;
    initialValue?: any;
    width?: string;
    options?: IOption[] | SelectOptionResource[];
    searchText?: string | null;
    class?: string;
};

export type FilterInputGroup = {
    key: string;
    label: string;
    inputs: FilterInput[];
    class?: string;
};

export interface BusinessResponse {
    BusinessList: BusinessResource[];
    CurrentPage: number;
    PageCount: number;
    PageSize: number;
    RecordCount: number;
}

export interface BusinessResource extends Resource {
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    BusinessID: number;
    Country: string;
    County: string;
    EmployeeNumber: string;
    HotScore: number;
    Industry: string;
    Locality: string;
    Name: string;
    PostCode: string;
    RegistrationNumber: string;
    SICCode: string;
    Telephone: string;
    Town: string;
    Turnover: string;
    VisitorType: string;
    Website: string;
}

export interface Conversion {
    Name: string;
}

export interface VisitDetails {
    Browser: string;
    Conversions: Conversion[];
    Device: string;
    Duration: string;
    OperatingSystem: string;
}

export interface BusinessData {
    BusinessID: string;
    Name: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    Locality: string;
    Town: string;
    County: string;
    PostCode: string;
    Country: string;
    Telephone: string;
    Website: string;
    Industry: string;
    SICCode: string;
    Turnover: string;
    RegistrationNumber: string;
    EmployeeNumber: string;
    HotScore: number;
    VisitorType: string;
}

export interface Supplier extends Resource {
    id: string;
    preferred: boolean;
    locked: boolean;
    lock_reason: string;
    closed: boolean | null;
    qualification_questionnaire_file: string | null;
    details: SupplierDetails;
    financials: SupplierFinancials;
    address: SupplierAddress;
    cis: SupplierCis;
    lockedByUser?: UserResource;
    timestamps: {
        created_at: Date;
        updated_at: Date;
    };
    tags: TagResource[] | null;
    has_expired_certificates?: boolean;
    locked_at?: string | Date;
    componentGroups?: ComponentGroup[];
    all_groups_can_be_assigned?: boolean;
    pre_con_scores?: string;
    con_scores?: string;
    assessments?: AssessmentResource[];
    sage_update_due?: boolean;
}

export interface CurrentOccupant extends Resource {
    id: string;
    floor: number;
    record_type: string;
    name: string;
    move_in_date: string;
    lease_break: string;
    move_out_date: string;
    address_type: string;
    other?: {
        status: string;
    };
}

export interface SupplierDetails {
    type: string;
    name: string;
    status: 'active' | 'inactive';
    primary_contact_name: string;
    email_for_purchases: string;
    email_for_accounts: string;
    mobile: string;
    ddi: string;
    favourited: boolean;
    telephone: string;
    fax: string;
    website: string;
}

export interface SupplierFinancials {
    code: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_sort_code: string;
    bank_account_name: string;
    bacs_reference: string;
    paid_by: string;
    nominal_code: NominalCode;
    max_open_purchase_order_value: string;
    credit_term: string;
    scheme: string;
    vat_registration_number: string;
    vat_code: string;
    company_number: string;
}

export interface SupplierAddress {
    company: string;
    address_line1: string;
    address_line2: string;
    address_line3: string;
    city: string;
    county: string;
    postcode: string;
    country: string;
    accepts_deliveries_for_us: boolean;
}

export interface SupplierCis {
    cis_verification_status: string | { key: string; label: string };
    cis_verification_date: string;
    utr_number: string;
    partnership_utr_number: string;
    ni_company_code: string;
    verification_number: string;
}

export interface PurchaseInvoice extends Resource {
    id: string;
    allocated: string;
    cindy_id: string;
    due_date: Date | string;
    invoice_date: Date | string;
    net_value: string | null;
    supplier: Supplier;
    project: Project;
    nominal: string;
    nominalCode: NominalCode;
    favourited: boolean;
    suppliers_invoice_number: string;
    tags: TagResource[];
    labour: string | null;
    materials: string | null;
    complete: boolean;
    vat: string;
    vat_code: string;
    vat_rate: number;
    status: PurchaseInvoiceStatus;
    type: PurchaseInvoiceType;
    responsible: UserResource;
    createdByUser: UserResource;
    purchaseOrder: PurchaseOrder;
    paid: boolean;
    gross_value: string | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date;
    };
    total_allocated?: string | null;
    responsibleUser?: UserResource;
    approved_at?: string | null;
    assigned_responsible_at?: string | null;
    completed_at?: string | null;
    assignedResponsibleByUser?: UserResource;
    completedByUser?: UserResource;
    approvedByUser?: UserResource;
    markedPaidByUser?: UserResource;
    paid_at?: string | null;
    purchaseInvoiceQuery?: PurchaseInvoiceQueryResource | null;
    investigation_required?: boolean;
    parent_id: number | null;
    reversed_from_id: number | null;
    debitNoteReversals: PurchaseInvoice[];
    unallocated?: string | null;
    cis_tax_rate: string | null;
    cis_tax_deduction: string | null;
    cis_payment: string | null;
    cis_excluded: boolean;
    bypass_transfer_process?: boolean;
    transferBatch?: PurchaseInvoiceTransferBatchResource | null;
    paymentBatch?: PurchaseInvoicePaymentBatchResource | null;
}

export interface PurchaseOrderAllocations extends Resource {
    allocatedByUser: UserResource;
    allocated_on: Date;
    allocated_value: string;
    id: string;
    nominalCode: NominalCode;
    project: Project;
    purchaseInvoice: PurchaseInvoice;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date;
    };
}

export interface PurchaseInvoiceDataInput {
    supplier: { id: string; label: string; type?: string } | null;
    invoice_date: string | Date | null;
    due_date: string | Date | null;
    suppliers_invoice_number: string | null;
    nominalCode: { id: string; label: string } | null;
    tags: TagInput[] | null;
    gross_value: number | null;
    net_value: number | null;
    vat: number | null;
    vat_rate: number | null;
    vat_code: string | null;
    labour: number | null;
    materials: number | null;
    paid: boolean | null;
    complete: boolean | null;
    cis_tax_rate: string | null;
    cis_tax_deduction: string | null;
    cis_payment: string | null;
    cis_excluded: boolean | null;
    bypass_transfer_process?: boolean;
}

export interface ProjectSubmitForApprove {
    users: [];
}

export interface ProjectLostDataInput {
    lost_to_company: string;
    loss_reason: string | null;
}

export interface Project extends Resource {
    id: string;
    name: string;
    type: ProjectType;
    scope: ProjectScope;
    status: ProjectStatus;
    pitch_date: string;
    order_received_date: string;
    start_date: string;
    completion_date: string;
    end_date: string;
    retention_period_end_date: string;
    safety_requirements: string;
    safetySupplierUser: UserResource | null;
    safety_status_process: string;
    safety_first_aider: string;
    defect_period: string;
    retention: string;
    lad: number;
    company: CompanyResource | null;
    siteAddress: AddressResource | null;
    customer_purchase_order_number: string;
    loi_value: string;
    loi_link: string;
    vat_rule: string;
    credit_terms: string;
    public_liability: number;
    employer_liability: number;
    employer_liability_required: boolean;
    repeat_business: boolean;
    professional_insurance: number;
    performance_bonds_required: boolean;
    performance_bonds_expiry_date: string;
    performance_bonds_link: string;
    collateral_warranty_end_date: number | null;
    sustainability_requirement: string;
    floors: { name: string }[];
    tags: TagResource[] | null;
    building_contract: string;
    invoicing_method: string;
    sign_date: string | Date;
    expiry_date: string | Date;
    parties: string[];
    warranties: warranty[];
    favourited: boolean;
    credit: ProjectCreditCheck;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    headcount: number | null;
    businessUnit: BusinessUnitResource;
    projectQuote: {
        id: string;
        customer_name: string | null;
        project_id: string;
        contact: ContactResource | null;
    };
    clientTeam?: ContactResource[];
    primaryContact?: ContactResource;
    latestMonitor: {
        comments: string;
        date: Date;
        gross_margin: number;
        profit: number;
        sales: number;
        timestamps: {
            created_at: Date;
            updated_at: Date;
            deleted_at: Date | null;
        };
        type: string;
    };
    wonOrLostProjectStatusHistory: {
        status: ProjectStatus;
        status_selected_by: string;
        project_won: string;
        comment: string;
        loss_reason: string;
    };
    projectStatusHistory?: ProjectStatusHistoryResponse[];
    description: string | null;
    projectDirector?: {
        id: string;
        role: OktraRole;
        user: UserResource;
    };
    approvalLogs?: ProjectApprovalLogResource[];
    approvedByUser: UserResource | null;
    submittedByUser: UserResource | null;
    rejectedByUser: UserResource | null;
    approved_at: Date | null;
    submitted_at: Date | null;
    rejected_at: Date | null;
    projectManager?: {
        id: string;
        user: UserResource | null;
    };
    salesman?: {
        id: string;
        user: UserResource | null;
    };
    leadOwner?: {
        id: string;
        user: UserResource | null;
    };
    latestProjectQuoteVersion?: null | QuoteVersion;
    unallocated_expenses?: string | null;
    has_new_sales_invoices?: boolean;
    prospect?: ProspectResource | null;
    loss_explanation?: string | null;
    total_invoice_plans_sales_price?: string | null;
}
export interface ProjectStatusHistoryResponse {
    status: ProjectStatus;
    status_selected_by: string;
    project_won: string;
    comment: string;
    loss_reason: string;
    user?: UserResource;
    win_analysis_code?: string;
}

export interface ProjectApprovalLogResource extends Resource {
    id: string;
    message: string | null;
    win_analysis_code: string | null;
    comments: string | null;
    timestamps: {
        created_at: string;
        updated_at: string;
        deleted_at: string;
        projectDirector?: {
            id: string;
            role: OktraRole;
            user: UserResource;
        };
    };
}

export interface ProjectDashboard extends Resource {
    client_team: UserResource[];
    oktra_team: UserResource[];
    third_party_client_team: UserResource[];
    status: {
        status: string | null;
        created_by: string | null;
        created_at: string | null;
        marked_as_lost_by: string | null;
        marked_lost_at: string | null;
        reason_of_loss: string | null;
        project_won: string | null;
        win_analysis_code: string | null;
        marked_as_closed_by: string | null;
        marked_closed_at: string | null;
    };
    summary: {
        id: number;
        name: string;
        scope: string;
        type: string;
        building_contract: string | null;
        address: Record<string, any>;
        floors: string[];
        size: number;
    };
    dates: {
        pitch_date: string | null;
        order_received_date: string | null;
        start_date: string | null;
        completion_date: string | null;
        end_date: string | null;
        retention_period_end_date: string | null;
        approved_date: string | null;
    };
    prospect_values: {
        sale: string;
        gp: string;
        gm: number;
        cost_per_sq_ft: number;
    };
    latest_quote: {
        cost_per_sq_ft: string;
        cost_per_sq_ft_change: string;
        cost_per_sq_ft_change_status: string;
        gm: string;
        gm_change: string;
        gm_change_status: string;
        gp: string;
        gp_change: string;
        gp_change_status: string;
        sale: string;
        sale_change: string;
        sale_change_status: string;
    };
    monitor_values: {
        cost_per_sq_ft: string;
        cost_per_sq_ft_change: string;
        cost_per_sq_ft_change_status: string;
        gm: string;
        gm_change: string;
        gm_change_status: string;
        gp: string;
        gp_change: string;
        gp_change_status: string;
        sale: string;
        sale_change: string;
        sale_change_status: string;
    };
    quote_for_totals: QuoteVersion;
    project_status_history: {
        status: string;
        status_selected_by: number;
        project_won: string;
        comment: string;
    }[];
    migrated_from_prospect: boolean;
    prospect_id: number;
    project_statistics: {
        cash_flow: number | string;
        balance_to_invoice: number | string;
        overdue_invoices: number | string;
        overdue_percentage_of_contract: number | string;
        notional_interest: number | string;
        unpaid_approved_invoices: number | string;
        unapproved_invoices: number | string;
        under_investigation: number | string;
    };
    additional_totals: {
        excluded_totals: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
        };
        optional_totals: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
        };
        variations: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
        };
        recoveries: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
        };
        cash_book: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
        };
        provisional_sum: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
        };
    };
    totals_panel: {
        adjudications: {
            gross_profit: number | string;
            gross_margin: number | string;
            cost: number | string;
            sales_per_sqft: number | string;
            total_sales: number | string;
        };
        live_adjustments: {
            cost: number | string;
            cost_flag: string;
            cost_text: string;
            sales: number | string;
            sales_flag: string;
            sales_text: string;
            gross_profit: number | string;
            gross_profit_flag: string;
            gross_profit_text: string;
            gross_margin: number | string;
            gross_margin_flag: string;
            gross_margin_text: string;
        };
        actual: {
            gross_profit: number | string;
            gross_margin: number | string;
            pos_raised: number | string;
            invoiced: number | string;
        };
    };
    contract_summary?: {
        opening_contract_value: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
            gross_margin: string | number;
        };
        total_contract_value: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
            gross_margin: string | number;
        };
        agreed_variations: VariationResource[] | [];
        not_agreed_variations: VariationResource[] | [];
        anticipated_contract_value: {
            total_sales: number | string;
            total_cost: number | string;
            total_profit: number | string;
            gross_margin: string | number;
        };
        agreed_totals: {
            total_sales: {
                amount: number;
                currency: string;
            };
            total_cost: {
                amount: number;
                currency: string;
            };
            total_profit: {
                amount: number;
                currency: string;
            };
            gross_margin_percent: string | number;
        };
        not_agreed_totals: {
            total_sales: {
                amount: number;
                currency: string;
            };
            total_cost: {
                amount: number;
                currency: string;
            };
            total_profit: {
                amount: number;
                currency: string;
            };
            gross_margin_percent: string | number;
        };
    };
}

export interface ProjectCreditCheck {
    id: UUID | string;
    max_credit: number | string;
    risk_indicator: string | null | { key: string; label: string };
    offshore: boolean;
    date_taken: Date | null | string;
    report_path: string;
}

export interface floor {
    name: string;
    sqft: number;
}
export interface warranty {
    id: UUID | string;
    sign_date: Date;
    expiry_date: Date;
    parties: string[];
}

export interface ProjectDataInput {
    id: string;
    name: string;
    type: string;
    scope: string;
    company: CompanyResource | null;
    building_contract: string | null;
    tags: TagInput[] | null;
    pitch_date: string;
    order_received_date: string;
    start_date: string;
    completion_date: string;
    end_date: string;
    retention_period_end_date: string;
    safety_requirements: string | null;
    safety_supplier_user: { id: string; label: string } | null;
    safety_status_process: string;
    safety_first_aider: string;
    defect_period: { key: string; label: string } | null;
    retention: { key: string; label: string } | null;
    lad: string | null;
    sustainability_requirement: string | null;
    public_liability: number;
    employer_liability: number;
    employer_liability_required: boolean;
    repeat_business: boolean;
    professional_insurance: number;
    customer_purchase_order_number: string;
    loi_value: number;
    loi_link: string;
    vat_rule: string | null;
    performance_bonds_required: boolean;
    performance_bonds_expiry_date: string;
    performance_bonds_link: string;
    collateral_warranty_end_date: string | null;
    site_address: { id: string; label: string } | null;
    headcount: number | null;
    description: string | null;
    invoicing_method: string | null;
    credit_terms: string | null;
}

export enum ProjectType {
    DnB = 'dnb',
    Furniture = 'furniture',
    SmallWorks = 'small-works',
    CustomerService = 'customer-service',
    Partitioning = 'partitioning',
}

export enum ProjectStatus {
    New = 'new',
    Approved = 'approved',
    Lost = 'lost',
    InRetention = 'retention',
    Closed = 'closed',
    Submitted = 'submitted',
    Agreed = 'agreed',
    Rejected = 'rejected',
}

export enum ProjectScope {
    CatA = 'cat-a',
    CatAnB = 'cat-anb',
    CatB = 'cat-b',
    InsituCatB = 'insitu-cat-b',
    SnCore = 'sncore',
    Tbc = 'tbc',
}

export enum ProjectBuildingContract {
    JctDnB2024 = 'jct-dnb-2024',
    JctDnB2016 = 'jct-dnb-2016',
    OktraStandard = 'oktra-standard',
    Other = 'other',
}

export enum ProjectInvoicingMethod {
    ValuationApplication = 'valuation-application',
    InvoiceStagePayment = 'invoice-stage-payment',
}

export enum SafetyRequirements {
    Outstanding = 'outstanding',
    Once = 'once',
    Weekly = 'weekly',
    Fortnightly = 'fortnightly',
    Monthly = 'monthly',
    MidProject = 'mid_project',
    NotRequired = 'not_required',
}

// Created new enum as above one have everything in lowercase
// to match with the API request / response
// and to avoid confusion
export enum SiteSafetyRequirements {
    Outstanding = 'Outstanding',
    Once = 'Once',
    Weekly = 'Weekly',
    Fortnightly = 'Fortnightly',
    Monthly = 'Monthly',
    MidProject = 'Mid Project',
    NotRequired = 'Not Required',
}

export enum NoteReportCategory {
    Nugget = 'nugget',
    Tip = 'tip',
    HighStatus = 'high-status',
    CallNote = 'call-note',
    HighStatusCall = 'high-status-call',
}

export enum Requirement {
    Landlord = 'landlord',
    Service = 'service',
    Tenant = 'tenant',
    Education = 'education',
    Labs = 'labs',
    Unknown = 'unknown',
}

export enum NoteReportQuality {
    Track = 'track',
    Rebook = 'rebook',
    Appointment = 'appointment',
}

export enum ForecastQuality {
    Ignore = 'ignore',
    FollowUp = 'follow-up',
    Warm = 'warm',
    Hot = 'hot',
    Commitment = 'commitment',
}

export enum VatRule {
    TBC = 'tbc',
    Standard = 'standard',
    Revenue = 'revenue',
    Account = 'account',
}

export enum JournalEntryType {
    Cashbook = 'cashbook',
    Automatic = 'automatic',
}

export interface Force24Data {
    external_id: string;
    guid: string;
    email: string;
    emailStatus: string;
    monthly_newsletter: boolean;
    workplace_updates: boolean;
    guidance_and_resource_update: boolean;
    companyName: string | null;
    mobile: string | null;
    leadScore: number | null;
}

export interface LushaData {
    id: string;
    external_id: number;
    first_name: string;
    last_name: string;
    current_company_name: string;
    current_job_title: string;
    company_website: string;
    email: {
        email: string;
        emailType: LushaEmailType;
        updateDate: string;
        emailConfidence: string;
    }[];
    phone_numbers: {
        number: string;
        phoneType: LushaPhoneType;
        doNotCall: boolean;
        updateDate: string | Date;
    }[];
    linkedin_url: string;
    crunchbase_url: string;
}

export enum LushaPhoneType {
    Mobile = 'mobile',
    Direct = 'direct',
}

export enum LushaEmailType {
    Work = 'work',
    Home = 'home',
}

export interface LushaValues {
    firstName: string;
    lastName: string;
    companyName: string;
    jobTitle: string;
    emailWork: string;
    emailHome: string;
    phoneMobile: string;
    phoneDirect: string;
    linkedinUrl: string;
    facebookUrl: string;
    xUrl: string;
}

export interface CognismValues {
    firstName: string;
    lastName: string;
    companyName: string;
    jobTitle: string;
    emailWork: string;
    emailHome: string;
    phoneMobile: string;
    phoneDirect: string;
    linkedinUrl: string;
    company_website: string;
    company_number: string;
    company_industry: string;
}

export interface CognismCompanyValues {
    industry: string;
    description: string;
    type: string;
    website: string;
    linkedinUrl: string;
    officePhoneNumbers: string;
    hqPhoneNumbers: string;
    headcount: string;
    revenue: string;
    industries: string;
    founded: string;
}

export interface LushaCompanyValues {
    logoUrl: string;
    industry: string;
    description: string;
    website: string;
    linkedinUrl: string;
    employees: string;
    founded: string;
    revenueRange: string;
    fundingReceived: string;
    fundingRounds: string;
    lastFundingRound: string;
    crunchbaseUrl: string;
}

export interface ForensicsValues {
    industry: string;
    website: string;
    revenue: string;
    telephone: string;
}

export interface LushaCompanyData {
    id: string;
    external_id: number;
    name: string;
    logo: string;
    industry: string;
    description: string;
    website: string;
    employees: string;
    founded: string;
    revenue: string;
    total_funding_received: string;
    rounds_undergone: number;
    last_round_type: string;
    last_round_amount: string;
    last_round_date: string;
    currency: string;
    linkedin_url: string;
    crunchbase_url: string;
}

export interface CognismContact {
    id: string;
    external_id: string;
    first_name: string;
    last_name: string;
    current_company_name: string;
    current_job_title: string;
    email: string;
    mobile_phone_numbers: string[];
    direct_phone_numbers: string[];
    linkedin_url: string;
    country: string;
    skills: string[];
    company_website: string;
    company_phone_numbers: string[];
    company_industry: string[];
}

export interface CognismCompany {
    id: string;
    external_id: string;
    name: string;
    description: string;
    founded: number;
    revenue: string;
    technologies: string[];
    industry: string[];
    type: string;
    website: string;
    linkedinUrl: string;
    officePhoneNumbers: string[];
    hqPhoneNumbers: string[];
    headcount: number;
}

export interface CertificateItem {
    id: string;
    type: SupplierCertificateType;
    holder: string;
    issued_at: Date;
    expires_at: Date;
    value: number;
    notes: string;
    archived: boolean;
    archived_at: Date;
    archivedBy: ContactResource;
    requested_at: Date | null;
    pqq_date: Date;
    pqq_file: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
    };
    contact: ContactResource;
    requestedBy: ContactResource;
    createdBy: ContactResource;
}

export enum SupplierType {
    supplier = 'Supplier',
    sub_con = 'SubCon',
}

export interface SupplierDataInput {
    sage_update_due: boolean;
    preferred: boolean;
    locked: boolean;
    lock_reason: string;
    closed: boolean;
    supplier_id: string;
    details: {
        type: { key: string; label: string } | string | null;
        name: string;
        primary_contact_name: string;
        telephone: string;
        fax: string;
        website: string;
        email_for_purchases: string;
        email_for_accounts: string;
    };
    accepts_deliveries_for_us: boolean;
    address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    financials: {
        code: string;
        nominal_code: { id: string; label: string } | string | null;
        bank_name: string;
        bank_account_number: string;
        bank_account_sort_code: string;
        bank_account_name: string;
        bacs_reference: string;
        paid_by: { key: string; label: string } | string | null;
        max_open_purchase_order_value: string;
        credit_term: { key: string; label: string } | string | null;
        scheme: { key: string; label: string } | string | null;
        vat_registration_number: string;
        vat_code: { key: string; label: string } | string | null;
        company_number: string;
    };
    cis: {
        cis_verification_status: { key: string; label: string } | string | null;
        cis_verification_date: string | null;
        utr_number: string;
        partnership_utr_number: string;
        ni_company_code: string;
        verification_number: string;
    };
    tags: TagInput[] | null;
    qualification_questionnaire_file: string;
    component_groups: string[] | { id: string; label: string }[] | null;
    all_groups_can_be_assigned?: boolean;
}

export interface SupplierCreateInput {
    details: {
        type: { key: string; label: string } | string | null;
        name: string;
        primary_contact_name: string;
        telephone: string;
        fax: string | null;
        website: string;
        email_for_purchases: string;
        email_for_accounts: string;
    };
    address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    financials: {
        nominal: string | null;
        paid_by: { key: string; label: string } | string | null;
        credit_term: { key: string; label: string } | string | null;
        scheme: { key: string; label: string } | string | null;
        vat_registration_number: string;
        vat_code: { key: string; label: string } | string | null;
    };
    component_groups: string[] | { id: string; label: string }[] | null;
    all_groups_can_be_assigned?: boolean;
}

export interface ComponentCode {
    id: string;
    code: string;
    description: string;
    group: ComponentGroup;
    name: string;
    references: number | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface Component extends Resource {
    id: string;
    title: string;
    code: ComponentCode;
    description: string;
    unit_of_measurement: string;
    unit_cost_price: number;
    unit_sales_price: number;
    base_component: boolean;
    exclude_from_specs: boolean;
    group: ComponentGroup;
    supplier: Supplier;
    description_internal?: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface ProjectSupplier {
    id: string | UUID;
    complete_purchase_invoices: string;
    open_purchase_orders: string;
    project: Project;
    purchase_orders: string;
    supplier: Supplier;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface ProjectComponent {
    id: string;
    title: string;
    code: ComponentCode;
    component_id?: string;
    description: string;
    description_internal: string;
    unit_of_measurement: string;
    unit_cost_price: number;
    floor: BuildingFloor;
    quantity: number;
    provisional_sum: boolean;
    quote_source: string;
    markup_percentage: number;
    pre_contract_expense: boolean;
    exclude_from_specs: boolean;
    optional: boolean;
    buying_lock_in: boolean;
    total_cost_price: number;
    unit_sales_price: number;
    total_sales_price: number;
    total_profit: number;
    gross_margin: number;
    group: ComponentGroup;
    supplier: Supplier;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    quoteVersionComponentCode?: QuoteVersionComponentCode;
    quoteVersionComponentGroup?: QuoteVersionComponentGroup;
    current?: string | null;
    is_overspend?: boolean;
    overspend?: {
        amount?: string | null;
        currency?: string | null;
    };
    buying_lock_in_reason?: string | null;
    balance?: string | null;
    current_total_cost_price?: string | number | null;
    project?: Project | null;
    projectVariation?: VariationResource | null;
}

export interface QuoteVersionComponentCode {
    id: string;
    name: string;
    code: string;
    description: string;
    component_code_id: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface QuoteVersionComponentGroup {
    id: string;
    name: string;
    code: string;
    component_group_id: string;
    total_cost_price: string;
    total_sales_price: string;
    total_profit: string;
    quoteVersion: QuoteVersion;
    quote_version_id: string;
}

export interface ComponentGroup {
    id: string;
    name: string;
    description: string | null;
    references: number | null;
    code: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface ComponentCreateInput {
    group: { id: string; label: string } | string | null;
    title: string;
    code: { id: string; label: string } | string | null;
    description: string;
    unit_of_measurement: { key: string; label: string } | string | null;
    unit_cost_price: string | null;
    unit_sales_price: string | null;
    supplier: { id: string; label: string } | string | null;
    base_component: boolean;
    exclude_from_specs: boolean;
}

export interface ProjectComponentFormInput {
    group: { id: string; label: string } | string | null;
    title: string;
    code: { key: string; label: string } | string | null;
    description_internal: string;
    description: string;
    floor: { key: string; label: string } | string | null;
    quantity: number | null;
    provisional: boolean;
    unit_of_measurement: { key: string; label: string } | string | null;
    unit_cost_price: string;
    unit_sales_price: string;
    quote_source: { key: string; label: string } | string | null;
    supplier: { id: string; label: string } | string | null;
    markup: string;
    total_cost_price: string;
    total_sales_price: string;
    total_profit: string;
    gross_margin: string;
    exclude_from_specs: boolean;
    optional: boolean;
    buying_lock_in: boolean;
    project: { id: string; label: string } | string | null;
    projectVariation: { id: string; label: string } | string | null;
}

export interface VariationComponentFormInput {
    group: { id: string; label: string } | string | null;
    title: string;
    code: { id: string; label: string } | string | null;
    description_internal: string;
    description: string;
    floor: { key: string; label: string } | string | null;
    quantity: number | null;
    // provisional: boolean;
    unit_of_measurement: { key: string; label: string } | string | null;
    unit_cost_price: string;
    unit_sales_price: string;
    quote_source: { key: string; label: string } | string | null;
    supplier: { id: string; label: string } | string | null;
    markup: string;
    total_cost_price: string;
    total_sales_price: string;
    total_profit: string;
    gross_margin: string;
    exclude_from_specs: boolean;
    // optional: boolean;
    buying_lock_in: boolean;
    project_id: { key: string; label: string } | string | null;
    variation_id: { key: string; label: string } | string | null;
}

export interface VariationComponentCreateInput {
    group: { id: string; label: string } | string | null;
    title: string;
    code: { key: string; label: string } | string | null;
    description_internal: string | null;
    description: string;
    project_floor: { key: string; label: string } | string | null;
    quantity: number | null;
    unit_of_measurement: { key: string; label: string } | string | null;
    unit_cost_price: string | null;
    unit_sales_price: string | null;
    quote_source: { key: string; label: string } | string | null;
    supplier: { id: string; label: string } | string | null;
    markup_percentage: string;
    total_cost_price: string;
    total_sales_price: string;
    total_profit: string;
    gross_margin: string;
    exclude_from_specs?: boolean;
    exclude?: boolean;
}

export interface NominalCode {
    id: string;
    code: number;
    group: NominalCodeGroup;
    status: NominalCodeStatus;
    description: string;
    references: number | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export enum NominalCodeGroup {
    Blank = '',
    Purchases = 'purchases',
    Overheads = 'overheads',
    FixedAssets = 'fixed-assets',
    Sales = 'sales',
    CurrentAssets = 'current-assets',
    CurrentLiabilities = 'current-liabilities',
    LongTermLiabilities = 'long-term-liabilities',
    CapitalAndReserves = 'capital-and-reserves',
    DirectExpenses = 'direct-expenses',
}

export enum NominalCodeStatus {
    Blank = '',
    Open = 'open',
    Closed = 'closed',
}

export interface ProjectPurchaseInvoice extends Resource {
    id: string;
    status: PurchaseInvoiceStatus;
    supplier: Supplier;
    suppliers_invoice_number: string;
    paid: boolean;
    gross: number;
    allocated_value: number;
    invoice_date: Date | null;
    due_date: Date | null;
    po_number: string[];
    nominal: string;
    nominalCode: NominalCode;
    favourited: boolean;
    responsible: UserResource;
    allocated_by: UserResource;
}

export interface ProjectOrderPlan extends Resource {
    alternative_address: boolean;
    alternative_supplier_address: boolean;
    cindy_id: string;
    created_at: string | Date | null;
    delivery_address: {
        company: string;
        address_line1: string;
        address_line2: string;
        address_line3: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    delivery_asap: boolean;
    delivery_date: string | null;
    delivery_tba: boolean;
    id: string;
    site_address: string;
    site_contact_name: string;
    site_contact_number: string;
    status: OrderPlanStatus;
    supplier: Supplier;
    value: number;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    purchaseOrder: PurchaseOrder;
    responsible: UserResource;
    project: Project;
    supplier_address: {
        company: string;
        address_line1: string;
        address_line2: string;
        address_line3: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    fao: string | null;
}

export interface OrderPlanDataInput {
    supplier:
        | {
              id: string;
              label: string;
              is_expired_certificate?: boolean;
              componentGroups?: { id: string; label: string }[];
              all_groups_can_be_assigned?: boolean;
          }
        | string
        | null;
    default_supplier_address: string;
    fao: string;
    alternative_supplier_address: boolean;
    supplier_address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string | { key: string; label: string } | null;
    };
    project: string | null | number;
    delivery_date: string | null;
    delivery_tba: boolean;
    delivery_asap: boolean;
    site_contact_name: string;
    site_contact_number: string;
    site_address: string;
    alternative_address: boolean;
    delivery_address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string | { key: string; label: string } | null;
    };
}

export interface ProjectOrderPlanLineItemResource extends Resource {
    id: string;
    balance_available: number;
    discount: number;
    discounted_unit_cost: number;
    quantity: number;
    reason_for_overspend: string;
    title: string;
    total_cost: number;
    unit_cost: number;
    uom: string;
    status: LineItemStatus;
    overspend: boolean;
    componentCode: ComponentCode;
    component: Component;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    globalComponent: Component;
}

export interface LineItemDataInput {
    global_component?: Component | null;
    component?: Component | null;
    title: string;
    unit_cost: number;
    quantity: number;
    uom: { key: string; label: string };
    discount: number;
    discounted_unit_cost: number;
    total_cost: number;
    reason_for_overspend: string | null;
}

export interface PurchaseOrderAssignments extends Resource {
    id: string;
    title: string;
    unit_cost: number;
    quantity: number;
    balance_available: number;
    discount: number;
    discounted_unit_cost: number;
    total_cost: number;
    uom: string;
    reason_for_overspend: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    purchaseOrder: PurchaseOrder;
}

export interface PurchaseOrderAnnualSummaryReport extends Resource {
    id: string;
    code: string | null;
    name: string;
    total_value: number;
    years: {
        year: string;
        sum: string;
        key: string;
    }[];
}

export interface PurchaseOrder extends Resource {
    id: string;
    status: PurchaseOrderStatus;
    sub_status: PurchaseOrderSubStatus;
    value: string;
    spent: number;
    balance: number;
    due_on: string;
    raised_on: string;
    responsible: UserResource;
    delivery_tba: boolean;
    delivery_asap: boolean;
    alternative_address: boolean;
    alternative_supplier_address: boolean;
    site_contact_name: string;
    site_contact_number: string;
    site_address: string;
    delivery_date: string;
    fao: string | null;
    description: string | null;
    nominalCode: NominalCode;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    delivery_address: {
        company: string;
        address_line1: string;
        address_line2: string;
        address_line3: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    supplier_address: {
        company: string;
        address_line1: string;
        address_line2: string;
        address_line3: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    supplier: Supplier;
    project: Project;
    team: any | null;
    favourited: boolean;
    line_items_sum_total_cost: string;
    components_sum_total_cost_price: string;
    global_components_sum_total_cost_price: string;
    total_allocated: number;
    approvedByUser?: UserResource;
    approved_at?: string | null;
    completedByUser?: UserResource;
    completed_at?: string | null;
    heldByUser?: UserResource;
    held_at?: string | null;
    openedByUser?: UserResource;
    open_at?: string | null;
    allocated_value: string;
    overspent_line_items_data: PurchaseOrderLineItemOverspendingResource[] | [];
}

export interface PurchaseOrderLineItemOverspendingResource extends Resource {
    id: string;
    overspend_reason_by: string;
    reason_for_overspend: string;
    title: string;
}

export interface ExportPDFResource {
    file_path?: string;
    message?: string;
}

export enum PurchaseOrderStatus {
    Open = 'open',
    Held = 'held',
    Approved = 'approved',
    Complete = 'complete',
}

export enum PurchaseOrderSubStatus {
    Pending = 'pending',
    NotYetApproved = 'not-yet-approved',
    Approved = 'approved',
    Rejected = 'rejected',
    OverspendRequiresApproval = 'overspend-requires-approval',
    SupplierLocked = 'supplier-locked',
    ManuallyCompleted = 'manually-completed',
    AutomaticallyCompleted = 'automatically-completed',
}

export enum PurchaseInvoiceStatus {
    Transfer = 'transfer',
    Approve = 'approve',
    Allocate = 'allocate',
    Assign = 'assign',
    Complete = 'complete',
    Incomplete = 'incomplete',
    InvestigationRequired = 'investigation-required',
}

export enum PurchaseInvoiceType {
    Standard = 'standard',
    DebitNote = 'debit_note',
}

export enum OrderPlanStatus {
    New = 'new',
    Ordered = 'ordered',
}

export enum LineItemStatus {
    New = 'new',
    Approved = 'approved',
}

export enum AsbestosReport {
    Received = 'received',
    Missing = 'missing',
    NotRequired = 'not-required',
}

export enum FullyExecutedContract {
    Received = 'received',
    Missing = 'missing',
}

export interface PurchaseOrderDataInput {
    supplier:
        | {
              id: string;
              label: string;
              is_expired_certificate?: boolean;
              componentGroups?: { id: string; label: string }[];
              all_groups_can_be_assigned?: boolean;
          }
        | string
        | null;
    default_supplier_address: string;
    fao: string;
    alternative_supplier_address: boolean;
    supplier_address: {
        company: string | null;
        address_line1: string | null;
        address_line2: string | null;
        city: string | null;
        county: string | null;
        postcode: string | null;
        country: string | null;
    };
    project: { id: string; label: string } | string | null | number;
    raised_on: string | null;
    nominalCode: { id: string; label: string } | string | null;
    responsible: { id: string; label: string } | string | null;
    delivery_date: string | null | Date;
    delivery_tba: boolean;
    delivery_asap: boolean;
    site_contact_name: string;
    site_contact_number: string;
    site_address: string;
    alternative_address: boolean;
    delivery_address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
}

export enum CertificateCategory {
    Insurance = 'insurance',
    Other = 'other',
}

export interface SupplierCertificateType {
    id: string;
    name: string;
    description: string;
    references: number | null;
    certificate_category: CertificateCategory;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface FilesCategories {
    id: string;
    name: string;
    description: string | null;
    references: number;
    created_at: Date | null;
    updated_at: Date | null;
}

export interface SupplyTerms {
    id: string;
    defect_period: string;
    retention: string;
    lad: string;
    credit_term: string;
    operations_maintenance_required: boolean;
    operations_maintenance_requested_on: string;
    operations_maintenance_received_on: string;
    project: Project;
    supplier: Supplier;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface SupplyTermsDataInput {
    defect_period: { key: string; label: string } | string | null;
    retention: { key: string; label: string } | string | null;
    lad: string | null;
    credit_term: { key: string; label: string } | string | null;
    operations_maintenance_required: boolean;
    operations_maintenance_requested_on: string | null;
    operations_maintenance_received_on: string | null;
}

export interface BuildingFloor extends Resource {
    id: string;
    name: string;
    short_name: string;
    description: string;
    references: number;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface ProjectFloorDataInput {
    floor: { id: string; label: string } | null;
    sqft: string | null;
    floorEditable: { id: string; label: string } | null;
    sqftEditable: string | null;
}

export interface ProjectFloorResource extends Resource {
    id: string;
    sqft: number;
    floor: BuildingFloor;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface ProjectMonitorResource {
    date: string;
    sales: number;
    profit: number;
    comments: string;
    project: Project;
    prospect: ProspectResource;
    gross_margin: number;
    timestamps?: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    type?: string;
    id: string;
    project_quote_id?: string;
    createdByUser: UserResource;
}

export interface QuoteComponentGroup {
    name: string;
    code: string;
    component_group_id: string;
    components: QuoteComponent[];
    subheadings: QuoteSubheading[];
}

export interface QuoteComponent {
    component_id: string;
    order: number;
    title: string;
    code: string;
    name: string;
    description: string;
    description_internal: string;
    project_floor_id: string;
    quantity: number;
    unit_of_measurement: string;
    unit_cost_price: string;
    markup_percentage: number;
    quote_source: string;
    supplier_id: string;
    optional: boolean;
    exclude_from_specs: boolean;
    provisional_sum: boolean;
}

export interface QuoteSubheading {
    order: number;
    title: string;
}

export interface Recovery {
    name: string;
    rate_percentage: number;
    id?: string;
    quote_version_id?: string;
    cost?: string;
    profit?: string;
}

export interface QuoteCreatePayload {
    creation_type: QuoteStatus;
    component_groups: QuoteComponentGroup[];
    recoveries: Recovery[];
}

export enum QuoteStatus {
    Initial = 'initial',
    MinorIncrease = 'minor-increase',
    MajorIncrease = 'major-increase',
}

export enum QuoteVersionStatus {
    Initial = 'Initial',
    Revision = 'Revision',
    Latest = 'Latest',
    Approved = 'Approved',
}

export interface QuoteVersion {
    id: string;
    version: string;
    status: QuoteVersionStatus;
    total_cost: string;
    total_sales: string;
    margin: string;
    recoveries: Recovery[];
    sales_per_sqft: string;
    total_profit: string;
    total_recoveries: number;
    total_sales_tendency: string;
    margin_tendency: string;
    sales_per_sqft_tendency: string;
    project_quote_id: string;
    created_at: string;
    componentGroups: QuoteVersionComponentGroup[];
    createdByUser: UserResource;
    projectQuote: ProjectQuote;
    total_sqft?: number;
    total_customer_cost?: string;
    total_customer_sales?: string;
    total_customer_profit?: string;
    total_customer_per_sqft_cost?: string;
    total_customer_per_sqft_sales?: string;
    total_customer_per_sqft_profit?: string;
    total_excluded_cost?: number;
    total_excluded_sales?: number;
    total_excluded_profit?: number;
    total_options_cost?: string;
    total_options_sales?: string;
    total_options_profit?: string;
    total_reporting_cost?: string;
    total_reporting_sales?: string;
    total_reporting_profit?: string;
    total_reporting_sales_per_sqft?: string;
    total_reporting_margin?: string;
    total_reporting_sales_tendency?: string;
    total_reporting_margin_tendency?: string;
    total_reporting_sales_per_sqft_tendency?: string;
    totalsBySources: {
        source: string;
        total_cost: string;
        total_sales: string;
        total_profit: string;
    }[];
    description?: string | null;
}

export interface ProjectQuote {
    customer_name: string | null;
    id: string;
    project_id: string;
    project?: Project;
}

export interface QuoteVersionComponentGroup {
    name: string;
    code: string;
    components: QuoteVersionComponent[];
    subheadings: QuoteSubheading[];
    id: string;
    component_group_id: string;
    quote_version_id: string;
    total_cost_price: string;
    total_customer_cost_price?: string;
    total_profit: string;
    total_customer_profit?: string;
    total_sales_price: string;
    total_customer_sales_price?: string;
    total_pos_raised?: string;
    total_balance_available: string | number;
    actual: string | number;
    actual_profit: string | number;
    actual_percentage: string | number;
    total_allocated?: string;
    total_available: string;
    total_balance: {
        amount: string;
        currency: string;
    };
    total_actual_profit: string;
    total_actual_profit_percentage: number;
}

export interface QuoteVersionComponent {
    code: string;
    component: Component;
    component_id: string;
    description: string;
    description_internal: string;
    exclude_from_specs: boolean;
    id: string;
    markup_percentage: string;
    optional: boolean;
    order: number;
    projectFloor: ProjectFloorResource;
    project_floor_id: string;
    provisional_sum: boolean;
    quantity: number;
    quote_source: string;
    supplier: Supplier;
    supplier_id: string;
    title: string;
    total_cost_price: string;
    total_profit: string;
    total_sales_price: string;
    unit_cost_price: string;
    unit_of_measurement: string;
    unit_sales_price: string;
    version_component_group_id: string;
    quoteVersionComponentCode: QuoteVersionComponentCode;
    journal_entry_id?: string | null;
}

export interface QuoteVersionComponentCode {
    id: string;
    name: string;
    code: string;
    description: string;
    component_code_id: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface Subheading {
    order: number;
    title: string;
}

export interface QuoteSubmitData {
    customer_name: string;
    contact_id: { id: string; label: string } | string | null;
}

export interface PurchaseInvoiceAllocation {
    id: string;
    allocated_value: string;
    allocated_on: Date | string | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    allocatedByUser?: UserResource;
    purchaseOrder?: PurchaseOrder;
}

export interface JournalEntriesDataInput {
    project?: { id: string; label: string } | string | null | number;
    date: Date | string | null;
    description: string | null;
    cost: number | null;
}

export interface JournalEntries extends Resource {
    id: string;
    project: Project;
    date: Date | string;
    description: string | null;
    cost: number;
    added_on: string;
    status: string;
    type: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    createdByUser: UserResource;
    allocated?: boolean;
    salesInvoice?: SalesInvoice;
    projectQuoteVersionComponent?: QuoteVersionComponent;
    journalEntryBatch?: JournalTransferBatchResource | null;
}

export interface AdjustmentsDataInput {
    date: Date | string;
    sales: number;
    profit: number;
    comments: string | null;
}
export interface MonitorResource {
    id: string;
    reference_id?: string;
    type: string;
    date: Date | string;
    sales: number;
    oktraTeam:
        | {
              id: string;
              role: OktraRole;
              user: UserResource;
          }[]
        | [];
    profit: number;
    comments: string;
    gross_margin: number;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    project?: Project;
    prospect?: ProspectResource;
    salesInvoice?: SalesInvoice;
    createdByUser?: UserResource;
    businessUnit?: BusinessUnitResource;
}

export interface ComponentGroupSales {
    id: string;
    quote_version_id: string;
    name: string;
    code: string;
    component_group_id: string;
    total_cost_price: string;
    total_options_cost_price: string;
    total_excluded_cost_price: number;
    total_customer_cost_price: string;
    total_sales_price: string;
    total_options_sales_price: string;
    total_excluded_sales_price: number;
    total_customer_sales_price: string;
    total_profit: string;
    total_options_profit: string;
    total_excluded_profit: number;
    total_customer_profit: string;
    total_pos_raised: number;
    total_balance_available: string;
    quoteVersion: { id: string };
}

export enum ExportQuotePdfTypes {
    QUANTS = 'quants-cost-plan',
    SUMMARY = 'summary-cost-plan',
    SCOPE_DOCUMENT = 'spec-scope-document',
}

export interface ProjectApprovalChecklistResource extends Resource {
    id: string;
    approve_low_gm: boolean;
    asbestos_report: string | null;
    fully_executed_contract: string | null;
    date_executed: Date | string | null;
    link_to_contract: string | null;
    win_analysis_code: string | null;
    site_safety_requirements: SafetyRequirements;
    siteSafetySupplier: UserResource | null;
    comments: string | null;
    timestamps?: {
        created_at: Date;
        updated_at: Date;
    };
}

export interface OverspendComponent {
    id: string;
    component: Component;
    budget: string | null;
    current: string | null;
    overspend: string | null;
    projectVariation?: VariationResource;
}

export interface POComponentAssigment {
    id: string;
    title: string;
    unit_cost: string;
    quantity: number;
    balance_available: string;
    discount: string | null;
    discounted_unit_cost: string;
    total_cost: string;
    reason_for_overspend: string | null;
    overspend: boolean;
    status: string | null;
    type: string;
    overspend_data?: {
        amount?: string | null;
        currency?: string | null;
    };
    purchaseOrder: PurchaseOrder;
}

export enum PerformanceBondStatus {
    Active = 'active',
    Complete = 'complete',
}

export interface PerformanceBond extends Resource {
    id: string;
    status: PerformanceBondStatus;
    start_date: Date | string | null;
    end_date: Date | string | null;
    value: string | null;
    policy_number: string | null;
    cancellation_email_sent: boolean;
    cancellation_email_sent_at: Date | string | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    project?: Project | null;
    supplier?: Supplier | null;
    cancellationEmailSentByUser?: UserResource | null;
}

export enum SupplierStatus {
    Active = 'active',
    Held = 'inactive',
    Closed = 'closed',
}

export interface PerformanceBondDataInput {
    project: { id: string; label: string } | string | null;
    supplier: { id: string; label: string } | string | null;
    start_date: Date | string | null;
    end_date: Date | string | null;
    value: string | null;
    policy_number: string | null;
    cancellation_email_sent: boolean;
    status: { key: string | null; label: string | null } | string | null;
}
export interface ProjectGPReport {
    id: string;
    project_id: string;
    project_name: string;
    project_company_name: string;
    project_team: string;
    project_status: ProjectStatus;
    approved_gm: number | null;
    approved_gm_trend: ProjectGPTrends;
    approved_gp: number | null;
    approved_gp_trend: ProjectGPTrends;
    approved_sales: number | null;
    approved_sales_trend: ProjectGPTrends;
    monitor_gm: number | null;
    monitor_gm_trend: ProjectGPTrends;
    monitor_gp: number | null;
    monitor_gp_trend: ProjectGPTrends;
    monitor_sales: number | null;
    monitor_sales_trend: ProjectGPTrends;
    forecast_gm: number | null;
    forecast_gp: number | null;
    forecast_sales: number | null;
    quote_gm: number | null;
    quote_gp: number | null;
    quote_sales: number | null;
    quote_gm_trend: ProjectGPTrends;
    quote_gp_trend: ProjectGPTrends;
    quote_sales_trend: ProjectGPTrends;
}

export enum ProjectGPTrends {
    Increasing = 'increasing',
    Stable = 'stable',
    Decreasing = 'decreasing',
}

export interface SalesAccountCreateInput {
    address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: { key: string; label: string } | string | null;
    };
    contact: {
        telephone: string;
        fax: string;
    };
    name: {
        title: { key: string; label: string } | string | null;
        first_name: string;
        last_name: string;
    };
    nominal_code: { key: string; label: string } | string | null;
    credit_term: { key: string; label: string } | string | null;
    vat_number: string;
    vat_code: { key: string; label: string } | string | null;
    credit_control_emails: string[];
    statement_emails: string[];
}

export interface SalesAccountDataInput {
    address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: { key: string; label: string } | string | null;
    };
    contact: {
        telephone: string;
        fax: string;
    };
    name: {
        title: { key: string; label: string } | string | null;
        first_name: string;
        last_name: string;
    };
    currency: { key: string; label: string } | string | null;
    nominal_code: { id: string; label: string } | string | null;
    credit_term: { key: string; label: string } | string | null;
    vat_number: string;
    vat_code: { key: string; label: string } | string | null;
    credit_control_emails: string[];
    statement_emails: string[];
    status: { key: string; label: string } | string | null;
    code: string;
    sage_update_due: boolean;
}

export interface SalesAccount extends Resource {
    id: string;
    code: string;
    name: {
        title: string;
        first_name: string;
        last_name: string;
    };
    address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    contact: {
        telephone: string;
        fax: string;
        email: string | null;
        mobile: string | null;
        ddi: string | null;
    };
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    credit_control_emails: string[];
    statement_emails: string[];
    credit_term: string | null;
    vat_code: string | null;
    vat_number: string | null;
    nominalCode: NominalCode | null;
    status: string;
    favourited?: boolean;
    contacts?: ContactResource[];
    currency?: string | null;
    invoices?: {
        not_due: {
            count: number;
            value: string;
        };
        due: {
            count: number;
            value: string;
        };
        overdue: {
            count: number;
            value: string;
        };
    };
    average_payment_days?: number | string | null;
    sage_update_due: boolean;
}

export interface SaleAccountEmails {
    id: string;
    name: {
        title: string;
        first_name: string;
        last_name: string;
    };
    statement_emails: string[];
    company_name: string;
}

export interface PaymentSupplierEmails {
    supplier_id: string;
    email: string;
    supplier_name: string;
    primary_contact: string;
}

export interface SalesInvoice extends Resource {
    id: string;
    status: string;
    contact_name: string;
    telephone: string;
    fax: string;
    deliverTo: {
        company: string | null;
        postcode: string;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        country: string;
    };
    is_deposit: boolean;
    vat_code: string;
    fx_currency: string;
    net_amount: string;
    retention_amount: string;
    vat_amount: string;
    gross_amount: string;
    payment_amount: string;
    customer_purchase_order_number: string;
    raised_at: string | null;
    due_at: string | null;
    paid_at: string | null;
    business_type: string;
    balance_amount: string;
    instructions: string | null;
    fixed_line_text: string | null;
    favourited?: boolean;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    salesAccount: SalesAccount;
    nominalCode: NominalCode | null;
    project: Project | null;
    responsibleUser: UserResource | null;
    description: string | null;
    revision_count?: number;
    interest_amount?: string | null;
    total_amount?: string | null;
    vo?: any;
    recharges_amount?: string | null;
    createdByUser?: UserResource | null;
    overdue_days?: number | string | null;
    plan: InvoicePlan | null;
    projectVariation?: VariationResource;
    parent_id: string | null;
    company?: CompanyResource;
    salesInvoiceTransferBatch?: SalesInvoiceTransferBatchResource | null;
}

export enum SalesInvoiceStatus {
    New = 'new',
    Paid = 'paid',
    Credit = 'credit',
    Cancelled = 'cancelled',
}

export interface SalesInvoiceDataInput {
    sales_account: {
        code: { id: string; label: string } | string | null;
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: { key: string; label: string } | string | null;
        credit_term: string | null;
    };
    telephone: string | null;
    fax: string | null;
    contact_name: string;
    deliver_to: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: { key: string; label: string } | string | null;
    };
    status: { key: string; label: string } | string | null;
    is_deposit: boolean;
    raised_at: string | null;
    due_at: string | null;
    vat_code: { key: string; label: string } | string | null;
    fx_currency: { key: string; label: string } | string | null;
    vat_rate: string | null;
    exchange_rate: string | null;
    nominal_code: { id: string; label: string } | string | null;
    customer_purchase_order_number: string;
    paid_at: string | null;
    payment_amount: string | null;
    balance_amount: string;
    project: { id: string; label: string } | string | null;
    variation: { id: string; label: string } | string | null;
    responsible_user: { id: string; label: string } | string | null;
    business_unit: { id: string; label: string } | string | null;
    business_type: { key: string; label: string } | string | null;
    invoice_plan?: string | null;
}

export interface SalesInvoiceTextInput {
    fixed_line_text: string | null;
    instructions: string | null;
}

export interface SalesLineDataInput {
    line_text: string;
    is_retention: boolean;
    quantity: number;
    unit_price: number;
    unit_of_measurement: { key: string; label: string } | string | null;
}

export interface SalesInvoiceLineItemResource extends Resource {
    id: string;
    line_text: string;
    is_retention: boolean;
    unit_of_measurement: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    unit_price_fx: string | null;
    total_price_fx: string | null;
    order: number;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface InvoicePlan extends Resource {
    id: string;
    project: Project;
    customer_purchase_order_number: string;
    due_at: string | Date | null;
    is_deposit_invoice: boolean;
    is_percent_values: boolean;
    is_retention_release: boolean;
    planned_at: string | Date | null;
    retention_amount: string | null;
    retention_amount_percent: number | null;
    sales_price_after_reductions: string | null;
    status: InvoicePlanStatus;
    salesAccount: SalesAccount | null;
    salesInvoice: SalesInvoice | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    favourited?: boolean;
    sales_price: string;
    sales_price_percent: number | null;
    invoice_line_text: string | null;
    instructions: string | null;
    fixed_line_text: string | null;
    createdByUser?: UserResource | null;
    projectVariation?: VariationResource | null;
}

export interface InvoicePlanDataInput {
    sales_account: { id: string; label: string } | string | null;
    is_deposit_invoice: boolean;
    is_percent_values: string;
    is_retention_release: boolean;
    planned_at: string | Date | null;
    due_at: string | Date | null;
    sales_price: number | null;
    sales_price_percent: number | null;
    retention_amount: number | null;
    retention_amount_percent: number | null;
    sales_price_after_reductions: number | null;
    customer_purchase_order_number: string;
    project_variation?: number | null;
}

export interface InvoicePlanTextInput {
    invoice_line_text: string | null;
    instructions: string | null;
    fixed_line_text: string | null;
}

export interface SalesInvoiceDebtorResource extends Resource {
    id: string;
    due_at: string | Date | null;
    gross_amount: string;
    outstanding_amount: string;
    not_due: string;
    overdue: string;
    overdue_30_plus_days_sum: string;
    overdue_60_plus_days_sum: string;
    overdue_90_plus_days_sum: string;
    overdue_120_plus_days_sum: string;
    balance_amount?: string;
}

export interface DebtorsReportResource extends Resource {
    id: string;
    code: string;
    company: string;
    gross_amount_sum: string;
    outstanding_amount_sum: string;
    not_due_amount_sum: string;
    overdue_30_plus_days_sum: string;
    overdue_60_plus_days_sum: string;
    overdue_90_plus_days_sum: string;
    overdue_120_plus_days_sum: string;
    overdue_amount_sum: string;
    salesInvoices: SalesInvoiceDebtorResource[];
    balance_amount_sum?: string;
    due_sum?: string | number;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
}

export interface FormattedDebtorsResource {
    id: string;
    debtorType: string;
    accountCode: string;
    account_id: string | null;
    invoice_id: string | null;
    company: string;
    gross_amount: string;
    outstanding_amount: string;
    not_due: string;
    due_at: string | Date | null;
    overdue_30_plus_days_sum: string;
    overdue_60_plus_days_sum: string;
    overdue_90_plus_days_sum: string;
    overdue_120_plus_days_sum: string;
    balance_amount?: string;
    due?: string | number;
}

export enum InvoicePlanStatus {
    New = 'new',
    Invoiced = 'invoiced',
}

export interface OnSiteReportResource {
    id: string;
    status: ProjectStatus;
    company: CompanyResource | null;
    location: string;
    project_team: string;
    start_date: Date | string | null;
    end_date: Date | string | null;
    description: string;
    type: string;
    businessUnit: BusinessUnitResource | null;
    projectManager: UserResource;
    siteManager: UserResource;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
}

export interface PurchaseInvoiceQueryResource extends Resource {
    id: string;
    query: string;
    status: PurchaseInvoiceQueryStatus;
    outcome: string;
    resolved_at: Date | string | null;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    responsibleUser: UserResource | null;
    responsibleSupplier: Supplier | null;
    createdByUser: UserResource;
    resolvedByUser?: UserResource | null;
    supplier?: Supplier | null;
    purchaseInvoice?: PurchaseInvoice | null;
    short_by?: string | null | number;
    purchase_orders_value?: string | null | number;
    project?: Project | null;
}

export enum PurchaseInvoiceQueryStatus {
    Resolved = 'resolved',
    Outstanding = 'outstanding',
}

export interface PurchaseInvoiceQueryDataInput {
    query: string;
    outcome: string;
    supplier_is_responsible: boolean;
    responsible_user: { id: string; label: string } | string | null;
    purchase_invoice?: string;
}

export interface PurchaseInvoiceQueryCreateInput {
    query: string;
    supplier_is_responsible: boolean;
    responsible_user: { id: string; label: string } | string | null;
    purchase_invoice?: string;
}

export interface ValuationResource extends Resource {
    id: string;
    project_id: string;
    predicted_percentage: string;
    prediction_amount: string;
    application_amount: string;
    application_date: string | Date | null;
    certificate_amount: string;
    certificate_date: string | Date | null;
    customer_certificate_number: string;
    payment_certificate_link: string | null;
    application_number: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    project: Project;
}

export interface RevisionResource extends Resource {
    id: string;
    revision_number: number;
    value: string;
    file_url: string;
    createdByUser: UserResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
}

export interface ValuationDataInput {
    project: string;
    predicted_percentage: string;
    prediction_amount: string;
    application_amount: string;
    application_date: string | Date | null;
    certificate_amount: string;
    certificate_date: string | Date | null;
    customer_certificate_number: string;
    payment_certificate_link: string | null;
    application_number: string;
}
export interface AgedInvoiceResource extends Resource {
    balance_amount: string | number;
    due: string | number;
    due_at: string | Date | null;
    gross_amount: string | number;
    overdue_0_30_days: string;
    overdue_31_60_days: string;
    overdue_61_90_days: string;
    overdue_91_120_days: string;
    overdue_120_plus_days: string;
    raised_at: string | Date | null;
}
export interface StatementGeneratorResource extends Resource {
    id: string;
    code: string;
    company: string;
    outstanding_count: number;
    status: string;
    outstanding_value: string;
    overdue_count: number;
    overdue_value: number;
    statement_emails: string[];
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    name: Name;
    address: {
        company: string | null;
    };
}

export interface DuplicateCheckResponse {
    type: string;
    duplicates: ContactDuplicateResource[];

    // Catch-all for dynamic keys like 'name.first_name', 'contact.mobile', etc.
    [field: string]: any; // Or more specifically: string[] | DuplicateEntry[] | string
}

export interface ContactDuplicateResource extends Resource {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    mobile: string | null;
    telephone: string | null;
    linkedin_url: string | null;
}

export interface ThirdPartyDuplicateResource extends Resource {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    mobile: string | null;
    telephone: string | null;
    linkedin_url: string | null;
}

export interface CompanyDuplicateResource extends Resource {
    id: string;
    name: string;
    email: string | null;
    website_url: string | null;
    mobile: string | null;
    telephone: string | null;
}

export interface SupplierDuplicateResource extends Resource {
    id: string;
    name: string;
    email: string | null;
    website: string | null;
    mobile: string | null;
    telephone: string | null;
    vat_registration_number: string | null;
    company: string | null;
}

export interface projectHealthCheckResource {
    id: string;
    adjudicated_gross_profit: string;
    adjudicated_gross_margin: number;
    adjudicated_cost: string;
    adjudicated_sales: string;
    live_gross_profit: string;
    live_gross_profit_delta: string;
    live_gross_profit_trend: string;
    live_gross_margin: number;
    live_gross_margin_delta: number;
    live_gross_margin_trend: string;
    live_cost: string;
    live_cost_delta: string;
    live_cost_trend: string;
    live_sales: string;
    live_sales_delta: string;
    live_sales_trend: string;
    actual_gross_profit: string;
    actual_gross_profit_delta: string;
    actual_gross_profit_trend: string;
    actual_gross_margin: number;
    actual_gross_margin_delta: number;
    actual_gross_margin_trend: string;
    actual_purchase_orders_raised: string;
    actual_purchase_orders_delta: string;
    actual_purchase_orders_trend: string;
    actual_invoiced: string;
    actual_invoiced_delta: string;
    actual_invoiced_trend: string;
    sales_invoices_total_net: string;
    sales_invoices_total_vat: string;
    sales_invoices_total_gross: string;
    sales_invoices_balance_to_invoice: string;
    purchasing_total_value: string;
    purchasing_total_allocated: string;
    purchasing_total_balance: string;
    purchasing_balance_available: string;
    componentGroups: QuoteVersionComponentGroup[];
    recoveryGroup: Recovery[];
    variationGroup: VariationResource[];
    journalEntryGroup: JournalEntries[];
}

export interface VariationCreateInput {
    is_internal: boolean | null;
    include_design_fee: boolean | null;
    include_prelim_fee: boolean | null;
    summary: string;
    vo_number: string;
}

export interface VariationResource {
    id: string;
    vo_number: string;
    status: VariationStatus;
    customer_purchase_order_number: string | null;
    company: CompanyResource | null;
    summary: string;
    fixed_text: string | null;
    is_internal: boolean;
    changes_main_completion_date: boolean;
    procurement_at: string | null;
    installation_at: string | null;
    instruction_type: VariationClientInstructionType | null;
    instruction_notes: string | null;
    total_cost_price: string | null;
    total_sales_price: string | null;
    total_profit: string | null;
    total_balance_available: string;
    variation_document_print_count: number;
    instruction_received_at: string | null;
    instruction_document_url: string | null;
    current_total_cost_price: string | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    gross_margin?: string | number | null;
    createdByUser?: UserResource;
    approvedByUser?: UserResource | null;
    approved_at: string | Date | null;
    internalApproveUser?: UserResource | null;
    internalApprovedByUser?: UserResource | null;
    internal_approved_at: string | Date | null;
    markedInstructedByUser?: UserResource | null;
    markedLostByUser?: UserResource | null;
    marked_instructed_at: string | Date | null;
    marked_lost_at: string | Date | null;
    submittedForInternalApproveByUser?: UserResource | null;
    submitted_for_internal_approve_at: string | Date | null;
    reason_for_loss?: string | null;
}

export interface VariationMeta {
    actions: {
        key: string;
        label: string;
    }[];
    checks: {
        label: string;
        success: boolean;
    }[];
}

export enum VariationStatus {
    New = 'new',
    PendingInternalApproval = 'pending-internal-approval',
    InstructedCostNotAgreed = 'instructed-cost-not-agreed',
    Approved = 'approved',
    Lost = 'lost',
    Closed = 'closed',
}

export interface BulkEmailResponseResource extends Resource {
    message: string;
}
export interface VariationDataInput {
    is_internal: boolean | null;
    summary: string | null;
    vo_number: string | null;
    customer_purchase_order_number: string | null;
    fixed_text: string | null;
    changes_main_completion_date: boolean;
    procurement_at: string | null;
    installation_at: string | null;
    instruction_type: { key: string; label: string } | string | null;
    instruction_notes: string | null;
    instruction_received_at: string | null;
    instruction_document_url: string | null;
}

export enum VariationClientInstructionType {
    EmployersAgentInstruction = 'eai',
    ContractAdministratorsInstruction = 'cai',
    Email = 'email',
    Other = 'other',
}

export interface BulkEmailResponseResource extends Resource {
    message: string;
}

export enum AssessmentType {
    PreCon = 'pre-con',
    Construction = 'construction',
}

export interface AssessmentCreateInput {
    supplier: { id: string; label: string } | null;
    component_group: { id: string; label: string } | null;
    type: AssessmentType;
    site_visit: { key: number; label: string } | null;
    interface: { key: number; label: string } | null;
    meeting_attendance: { key: number; label: string } | null;
    design_input: { key: number; label: string } | null;
    quote_quality: { key: number; label: string } | null;
    quote_timeliness: { key: number; label: string } | null;
    cost: { key: number; label: string } | null;
}

export interface ConstructionAssessmentCreateInput {
    supplier: { id: string; label: string } | null;
    component_group: { id: string; label: string } | null;
    type: AssessmentType;
    project_management: { key: number; label: string } | null;
    site_supervision: { key: number; label: string } | null;
    meeting_attendance: { key: number; label: string } | null;
    design_input: { key: number; label: string } | null;
    financial_management: { key: number; label: string } | null;
    installation_quality: { key: number; label: string } | null;
    programme_management: { key: number; label: string } | null;
}

export interface AssessmentResource extends Resource {
    id: string;
    supplier: Supplier;
    componentGroup: ComponentGroup;
    type: AssessmentType;
    scores: {
        site_visit: number | null;
        interface: number | null;
        meeting_attendance: number | null;
        design_input: number | null;
        quote_quality: number | null;
        quote_timeliness: number | null;
        cost: number | null;
        score: string;
        project_management?: number | null;
        site_supervision?: number | null;
        financial_management?: number | null;
        installation_quality?: number | null;
        programme_management?: number | null;
    };
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    lastUpdatedByUser?: UserResource | null;
    project?: Project | null;
}

export interface LeadForensicsMatchResource {
    lead_forensics: {
        businessId: number;
        name: string;
        addressLine1: string;
        addressLine2: string;
        addressLine3: string;
        locality: string;
        town: string;
        county: string;
        postCode: string;
        country: string;
        telephone: string;
        website: string;
        industry: string;
        sicCode: string;
        turnover: string;
        registrationNumber: string;
        employeeNumber: string;
        hotScore: number;
        visitorType: string;
    };
    matches: CompanyResource[];
}

export enum ForensicsType {
    Oktra = 'oktra',
    StrategyHat = 'strategy-hat',
}

export interface NotesReport extends Resource {
    id: string;
    body: string;
    category: string;
    author: UserResource;
    lead: LeadResource | null;
    prospect: ProspectResource | null;
    nextCall: MyCallsResource | null;
    researcher: UserResource | null;
    networker: UserResource | null;
    caller: UserResource | null;
    salesman: UserResource | null;
    projectManager: UserResource | null;
    company: CompanyResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    is_call: boolean;
    quality: string;
    nextResearchCall: MyCallsResource | null;
}

export interface AccountingPeriod extends Resource {
    id: string;
    start_year: string;
    end_year: string;
    reporting_year: string;
    quarter_1_start: string;
    quarter_1_end: string;
    quarter_2_start: string;
    quarter_2_end: string;
    quarter_3_start: string;
    quarter_3_end: string;
    quarter_4_start: string;
    quarter_4_end: string;
    is_current?: boolean;
}

export interface AccountingPeriodDataInput {
    start_year: string;
    end_year: string;
    reporting_year: string;
    quarter_1_start: string;
    quarter_1_end: string;
    quarter_2_start: string;
    quarter_2_end: string;
    quarter_3_start: string;
    quarter_3_end: string;
    quarter_4_start: string;
    quarter_4_end: string;
}

export interface EventsListResource extends Resource {
    id: string;
    prospects: ProspectResource | null;
    event: EventResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
}

export interface ForecastChangeReport extends Resource {
    id: string;
    forecast_date: string | Date | null;
    estimated_budget: string;
    gross_profit: string;
    gross_margin: string;
    agent_fee: number;
    forecast_quality: string | null;
    forecast_quality_old: string | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    prospect: ProspectResource;
    createdByUser: UserResource | null;
}

export interface ApprovedProjectResource extends Resource {
    id: string;
    name: string;
    sale_value: number;
    profit_value: number;
    adjustment_value: number;
    unpaid_invoices_count: number;
    unpaid_invoices_amount: number;
    unprocessed_inv_plan_count: number;
    unprocessed_inv_plan_amount: number;
    open_pis_count: number;
    open_pis_amount: number;
    open_pos_count: number;
    open_pos_amount: number;
    unprocessed_order_plan_count: number;
    unprocessed_order_plan_amount: number;
    open_variation_count: number;
    open_variation_amount: number;
    unreclaimed_retention_amount: number;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
}

export enum ProspectStatus {
    COLD = 'cold',
    WARM = 'warm',
    HOT = 'hot',
    SUPER_HOT = 'super-hot',
    ENQUIRY = 'enquiry',
    ORDERED = 'ordered',
    LOST = 'lost',
    ARCHIVED = 'archived',
}
export interface ProspectStatusHistoryResource extends Resource {
    readonly id: string;
    readonly prospect_id: string | number;
    readonly prospect_name: string;
    readonly estimation_budget: {
        amount: string;
        currency: string | null;
    } | null;
    readonly gross_profit: {
        amount: string;
        currency: string | null;
    } | null;
    readonly forecast_quality: string | null;
    readonly forecast_date: Date | string | null;
    readonly caller: null | { id: string | number; name: string | null };
    readonly status_from: ProspectStatus;
    readonly status_to: ProspectStatus;
    readonly change_date: string | Date | null;
    readonly last_note_date: string | Date | null;
    readonly last_note?: NoteResource;
    readonly changed_by?: {
        id: string;
        name: string;
    };
    readonly timestamps: {
        readonly created_at: Date;
        readonly updated_at: Date;
        readonly deleted_at: Date | null;
    };
    readonly designer?: null | {
        id: string | number;
        name: string | null;
    };
    readonly pc_manager?: null | {
        id: string | number;
        name: string | null;
    };
    readonly project_manager?: null | {
        id: string | number;
        name: string | null;
    };
    readonly salesman?: null | {
        id: string | number;
        name: string | null;
    };
}
export interface PurchaseInvoiceTransferBatchDataInput {
    cut_off_date: string | Date | null;
    description: string | null;
    vat_code_t18: boolean;
}

export interface JournalTransferBatchDataInput {
    cut_off_date: string | Date | null;
    description: string | null;
}

export interface PurchaseInvoicePaymentBatchDataInput {
    cut_off_date: string | Date | null;
    supplier: { id: string; label: string } | string | null;
}

export interface PurchaseInvoiceTransferBatchResource extends Resource {
    cut_off_date: string | Date | null;
    description: string | null;
    vat_code_t18: boolean;
    owner?: UserResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    total_payment_value?: string | null;
    status?: PurchaseInvoiceTransferStatus;
    total_invoices: string | number;
    total_suppliers: string | number;
}

export interface JournalTransferBatchResource extends Resource {
    cut_off_date: string | Date | null;
    description: string | null;
    owner?: UserResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    total_payment_value?: string | null;
    status?: PurchaseInvoiceTransferStatus;
    total_journal_entries_cost?: string | number;
    total_journal_entries?: string | number;
}

export interface SalesInvoiceTransferBatchResource extends Resource {
    cut_off_date: string | Date | null;
    description: string | null;
    createdByUser?: UserResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    value?: string | null;
    status?: PurchaseInvoiceTransferStatus;
    sales_invoices_count?: string | number;
    sales_accounts_count?: string | number;
}

export interface PurchaseInvoicePaymentBatchResource extends Resource {
    cut_off_date: string | Date | null;
    description: string | null;
    supplier?: Supplier | null;
    owner?: UserResource | null;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
    purchase_invoices_total_gross_value?: string | null;
    status?: PurchaseInvoiceTransferStatus;
    total_invoices?: string | number;
    total_suppliers?: string | number;
}

export enum PurchaseInvoiceTransferStatus {
    New = 'new',
    Complete = 'complete',
}

export interface MonitorDashboardResource {
    order_monitor_analysis: {
        title: string | undefined;
        items: [];
    };
    sales_invoices_analysis: {
        title: string | undefined;
        items: [];
    };
    purchase_orders_analysis: {
        title: string | undefined;
        items: [];
    };
    purchase_invoice_analysis: {
        title: string | undefined;
        items: [];
    };
    prospects_analysis: {
        title: string | undefined;
        items: [];
    };
}
export interface PiTransferSupplier extends Resource {
    id: string;
    name: string;
    email?: string;
    update_due: boolean;
    total_invoices_count: number;
    total_invoices_net_value: string;
    total_invoices_vat: string;
    total_gross_value: string;
    total_cis_tax_deduction: string;
    total_invoices_transfer: string;
    primary_contact_name?: string;
    code?: string;
    timestamps: {
        created_at: Date | string | null;
        updated_at: Date | string | null;
        deleted_at?: Date | null;
    };
}

export interface MonitorTotals {
    total_sales: string | number;
    total_gross_profit: string | number;
    total_gross_margin: string | number;
    predicted_sales: string | number;
    predicted_gross_profit: string | number;
}

export interface ProspectWallChart extends MonitorTotals {
    commitment: MonitorTotals;
    hot: MonitorTotals;
    warm: MonitorTotals;
    follow_up: MonitorTotals;
}

export interface ProjectWallChartResource {
    user: string;
    data: {
        id: string | number;
        // company_name: string | null;
        company: {
            id: string | number;
            name: string | null;
        };
        status: string | null;
        sales: string | number;
        gross_profit: string | number;
        gross_margin: string | number;
        previous_gross_profit: string | number;
        description?: string | null;
        date?: string | Date | null;
        note?: string | null;
    }[];
    total_sales: string | number;
    total_gross_profit: string | number;
    total_gross_margin: string | number;
}

export interface ProjectTotals {
    sales: number | string;
    gross_profit: number | string;
    gross_margin: number | string;
    predicted_gross_profit?: number | string;
}

export interface InvoicesWallChartResource {
    id: string | number;
    company_name: string | null;
    net_value: string | number;
    description: string | null;
}

export interface InvoicesTotals {
    net_value: string | number;
}
export interface MonitorWallChartResource {
    overview: {
        ordered: MonitorTotals;
        lost: MonitorTotals;
        manual_invoices: MonitorTotals;
        prospects: ProspectWallChart;
        total: MonitorTotals;
    };
    ordered_projects: ProjectWallChartResource[];
    ordered_projects_total: ProjectTotals;
    lost_projects: ProjectWallChartResource[];
    lost_projects_total: ProjectTotals;
    manual_invoices: InvoicesWallChartResource[];
    manual_invoices_total: InvoicesTotals;
    prospect_commitment: ProjectWallChartResource[];
    prospect_commitment_total: ProjectTotals;
    prospect_hot: ProjectWallChartResource[];
    prospect_hot_total: ProjectTotals;
    prospect_warm: ProjectWallChartResource[];
    prospect_warm_total: ProjectTotals;
    prospect_follow_up1: ProjectWallChartResource[];
    prospect_follow_up_total: ProjectTotals;
}
export interface SageSalesAccount extends Resource {
    address: {
        company: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        county: string;
        postcode: string;
        country: string;
    };
    code: string;
    contact: {
        telephone: string;
        fax: string;
        email: string | null;
        mobile: string | null;
        ddi: string | null;
    };
    credit_control_emails: string[];
    credit_term: string | null;
    currency: string | null;
    id: string;
    invoices?: {
        not_due: {
            count: number | null;
            value: string;
        };
        due: {
            count: number | null;
            value: string;
        };
        overdue: {
            count: number | null;
            value: string;
        };
    };
    name: {
        title: string;
        first_name: string;
        last_name: string;
    };
    sage_update_due: boolean;
    sales_invoices_count: number | null;
    sales_invoices_net_amount: string | null;
    sales_invoices_total_amount: string | null;
    sales_invoices_vat_amount: string | null;
    statement_emails: string[];
    status: string;
    timestamps: {
        created_at: Date;
        updated_at: Date;
        deleted_at: Date | null;
    };
    vat_code: string | null;
    vat_number: string | null;
}
