--
-- PostgreSQL database dump
--


-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-25 00:37:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

-- SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 17128)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 219 (class 1259 OID 17127)
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5267 (class 0 OID 0)
-- Dependencies: 219
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- TOC entry 234 (class 1259 OID 17296)
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    hospital_id integer NOT NULL,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    reason text NOT NULL,
    status character varying(30) DEFAULT 'requested'::character varying,
    doctor_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 233 (class 1259 OID 17295)
-- Name: appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.appointments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5268 (class 0 OID 0)
-- Dependencies: 233
-- Name: appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.appointments_id_seq OWNED BY public.appointments.id;


--
-- TOC entry 244 (class 1259 OID 17417)
-- Name: clinical_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinical_notes (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    assessment text NOT NULL,
    plan text,
    request_to_nurse text,
    nurse_response text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 243 (class 1259 OID 17416)
-- Name: clinical_notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinical_notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5269 (class 0 OID 0)
-- Dependencies: 243
-- Name: clinical_notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinical_notes_id_seq OWNED BY public.clinical_notes.id;


--
-- TOC entry 242 (class 1259 OID 17400)
-- Name: clinical_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinical_orders (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    order_type character varying(50) NOT NULL,
    description text NOT NULL,
    details text,
    status character varying(30) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 241 (class 1259 OID 17399)
-- Name: clinical_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clinical_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5270 (class 0 OID 0)
-- Dependencies: 241
-- Name: clinical_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clinical_orders_id_seq OWNED BY public.clinical_orders.id;


--
-- TOC entry 252 (class 1259 OID 17510)
-- Name: doctor_ratings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctor_ratings (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    doctor_id integer NOT NULL,
    rating integer NOT NULL,
    review text,
    is_reported boolean DEFAULT false,
    report_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- TOC entry 251 (class 1259 OID 17509)
-- Name: doctor_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctor_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5271 (class 0 OID 0)
-- Dependencies: 251
-- Name: doctor_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctor_ratings_id_seq OWNED BY public.doctor_ratings.id;


--
-- TOC entry 224 (class 1259 OID 17170)
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    license_number character varying(50) NOT NULL,
    specialization character varying(100) NOT NULL,
    years_of_experience integer NOT NULL,
    institution_name character varying(100) NOT NULL,
    registration_number character varying(50) NOT NULL,
    license_document character varying(255),
    hospital_ids integer[],
    status character varying(30) DEFAULT 'pendingadminapproval'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    avatar text
);


--
-- TOC entry 223 (class 1259 OID 17169)
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.doctors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5272 (class 0 OID 0)
-- Dependencies: 223
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- TOC entry 232 (class 1259 OID 17274)
-- Name: health_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_logs (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    systolic_bp integer NOT NULL,
    diastolic_bp integer NOT NULL,
    heart_rate integer NOT NULL,
    temperature numeric(4,2) NOT NULL,
    oxygen_level integer NOT NULL,
    mood character varying(20),
    symptoms jsonb,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 231 (class 1259 OID 17273)
-- Name: health_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.health_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5273 (class 0 OID 0)
-- Dependencies: 231
-- Name: health_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.health_logs_id_seq OWNED BY public.health_logs.id;


--
-- TOC entry 222 (class 1259 OID 17149)
-- Name: hospitals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hospitals (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    registration_number character varying(50) NOT NULL,
    address text NOT NULL,
    phone character varying(20) NOT NULL,
    type character varying(50),
    specialties text[],
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 221 (class 1259 OID 17148)
-- Name: hospitals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.hospitals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5274 (class 0 OID 0)
-- Dependencies: 221
-- Name: hospitals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.hospitals_id_seq OWNED BY public.hospitals.id;


--
-- TOC entry 236 (class 1259 OID 17330)
-- Name: lab_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lab_results (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    hospital_id integer,
    doctor_id integer,
    test_name character varying(100) NOT NULL,
    test_type character varying(50),
    result_summary text,
    result_data jsonb,
    file_url character varying(255),
    status character varying(30) DEFAULT 'ready'::character varying,
    collected_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nurse_id integer,
    review_note text
);


--
-- TOC entry 235 (class 1259 OID 17329)
-- Name: lab_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lab_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5275 (class 0 OID 0)
-- Dependencies: 235
-- Name: lab_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lab_results_id_seq OWNED BY public.lab_results.id;


--
-- TOC entry 238 (class 1259 OID 17362)
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer NOT NULL,
    sender_role character varying(20) NOT NULL,
    receiver_id integer NOT NULL,
    receiver_role character varying(20) NOT NULL,
    message_text text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 237 (class 1259 OID 17361)
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5276 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- TOC entry 240 (class 1259 OID 17379)
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_role character varying(20) NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(20) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 239 (class 1259 OID 17378)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5277 (class 0 OID 0)
-- Dependencies: 239
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 246 (class 1259 OID 17431)
-- Name: nurse_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nurse_reports (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    nurse_id integer NOT NULL,
    title character varying(200) DEFAULT 'Shift Report'::character varying,
    summary text NOT NULL,
    recommendations text,
    steps jsonb DEFAULT '[]'::jsonb,
    vitals_snapshot jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 245 (class 1259 OID 17430)
-- Name: nurse_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nurse_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5278 (class 0 OID 0)
-- Dependencies: 245
-- Name: nurse_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nurse_reports_id_seq OWNED BY public.nurse_reports.id;


--
-- TOC entry 226 (class 1259 OID 17193)
-- Name: nurses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nurses (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    license_number character varying(50) NOT NULL,
    qualification character varying(100) NOT NULL,
    years_of_experience integer NOT NULL,
    institution_name character varying(100) NOT NULL,
    registration_number character varying(50) NOT NULL,
    license_document character varying(255),
    hospital_ids integer[],
    status character varying(30) DEFAULT 'pendingadminapproval'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    avatar text
);


--
-- TOC entry 225 (class 1259 OID 17192)
-- Name: nurses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nurses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5279 (class 0 OID 0)
-- Dependencies: 225
-- Name: nurses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nurses_id_seq OWNED BY public.nurses.id;


--
-- TOC entry 250 (class 1259 OID 17489)
-- Name: nursing_task_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nursing_task_steps (
    id integer NOT NULL,
    task_id integer NOT NULL,
    step_name character varying(100) NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying,
    completed_at timestamp without time zone,
    notes text,
    sort_order integer NOT NULL
);


--
-- TOC entry 249 (class 1259 OID 17488)
-- Name: nursing_task_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nursing_task_steps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5280 (class 0 OID 0)
-- Dependencies: 249
-- Name: nursing_task_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nursing_task_steps_id_seq OWNED BY public.nursing_task_steps.id;


--
-- TOC entry 248 (class 1259 OID 17453)
-- Name: nursing_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nursing_tasks (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    task_type character varying(50),
    patient_id integer NOT NULL,
    nurse_id integer NOT NULL,
    doctor_id integer,
    hospital_id integer NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying,
    current_step integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    result_summary text,
    result_file character varying(255),
    lab_test_id integer
);


--
-- TOC entry 247 (class 1259 OID 17452)
-- Name: nursing_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nursing_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5281 (class 0 OID 0)
-- Dependencies: 247
-- Name: nursing_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nursing_tasks_id_seq OWNED BY public.nursing_tasks.id;


--
-- TOC entry 230 (class 1259 OID 17245)
-- Name: patient_nurse_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patient_nurse_assignments (
    id integer NOT NULL,
    patient_id integer NOT NULL,
    nurse_id integer NOT NULL,
    assigned_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 229 (class 1259 OID 17244)
-- Name: patient_nurse_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patient_nurse_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5282 (class 0 OID 0)
-- Dependencies: 229
-- Name: patient_nurse_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patient_nurse_assignments_id_seq OWNED BY public.patient_nurse_assignments.id;


--
-- TOC entry 228 (class 1259 OID 17216)
-- Name: patients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.patients (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    hospital_id integer,
    doctor_id integer,
    status character varying(30) DEFAULT 'ACTIVE'::character varying,
    condition character varying(50) DEFAULT 'stable'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_vital_check timestamp without time zone,
    phone character varying(20),
    age integer,
    gender character varying(20),
    address text,
    profile_picture character varying(255)
);


--
-- TOC entry 227 (class 1259 OID 17215)
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.patients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5283 (class 0 OID 0)
-- Dependencies: 227
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- TOC entry 254 (class 1259 OID 17539)
-- Name: platform_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_reviews (
    id integer NOT NULL,
    user_id integer NOT NULL,
    user_role character varying(50) NOT NULL,
    user_name character varying(100) NOT NULL,
    user_avatar text,
    rating integer NOT NULL,
    review_text text NOT NULL,
    is_featured boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT platform_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- TOC entry 253 (class 1259 OID 17538)
-- Name: platform_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.platform_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5284 (class 0 OID 0)
-- Dependencies: 253
-- Name: platform_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.platform_reviews_id_seq OWNED BY public.platform_reviews.id;


--
-- TOC entry 4941 (class 2604 OID 17131)
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- TOC entry 4966 (class 2604 OID 17299)
-- Name: appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments ALTER COLUMN id SET DEFAULT nextval('public.appointments_id_seq'::regclass);


--
-- TOC entry 4984 (class 2604 OID 17420)
-- Name: clinical_notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_notes ALTER COLUMN id SET DEFAULT nextval('public.clinical_notes_id_seq'::regclass);


--
-- TOC entry 4980 (class 2604 OID 17403)
-- Name: clinical_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_orders ALTER COLUMN id SET DEFAULT nextval('public.clinical_orders_id_seq'::regclass);


--
-- TOC entry 4998 (class 2604 OID 17513)
-- Name: doctor_ratings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_ratings ALTER COLUMN id SET DEFAULT nextval('public.doctor_ratings_id_seq'::regclass);


--
-- TOC entry 4949 (class 2604 OID 17173)
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- TOC entry 4964 (class 2604 OID 17277)
-- Name: health_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_logs ALTER COLUMN id SET DEFAULT nextval('public.health_logs_id_seq'::regclass);


--
-- TOC entry 4945 (class 2604 OID 17152)
-- Name: hospitals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospitals ALTER COLUMN id SET DEFAULT nextval('public.hospitals_id_seq'::regclass);


--
-- TOC entry 4970 (class 2604 OID 17333)
-- Name: lab_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_results ALTER COLUMN id SET DEFAULT nextval('public.lab_results_id_seq'::regclass);


--
-- TOC entry 4973 (class 2604 OID 17365)
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- TOC entry 4976 (class 2604 OID 17382)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4986 (class 2604 OID 17434)
-- Name: nurse_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nurse_reports ALTER COLUMN id SET DEFAULT nextval('public.nurse_reports_id_seq'::regclass);


--
-- TOC entry 4953 (class 2604 OID 17196)
-- Name: nurses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nurses ALTER COLUMN id SET DEFAULT nextval('public.nurses_id_seq'::regclass);


--
-- TOC entry 4996 (class 2604 OID 17492)
-- Name: nursing_task_steps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_task_steps ALTER COLUMN id SET DEFAULT nextval('public.nursing_task_steps_id_seq'::regclass);


--
-- TOC entry 4991 (class 2604 OID 17456)
-- Name: nursing_tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_tasks ALTER COLUMN id SET DEFAULT nextval('public.nursing_tasks_id_seq'::regclass);


--
-- TOC entry 4962 (class 2604 OID 17248)
-- Name: patient_nurse_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_nurse_assignments ALTER COLUMN id SET DEFAULT nextval('public.patient_nurse_assignments_id_seq'::regclass);


--
-- TOC entry 4957 (class 2604 OID 17219)
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- TOC entry 5002 (class 2604 OID 17542)
-- Name: platform_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_reviews ALTER COLUMN id SET DEFAULT nextval('public.platform_reviews_id_seq'::regclass);


--
-- TOC entry 5227 (class 0 OID 17128)
-- Dependencies: 220
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.admin_users (id, username, email, password, full_name, is_active, created_at, updated_at) VALUES (2, 'admin', 'admin@lk', '$2b$10$QxszCTaKfY9vJahtpuyPcO82Dm/nnqavUPkzIn8tz2aMUUoeyLz9W', 'System Administrator', true, '2026-03-29 21:14:48.695704', '2026-03-29 21:14:48.695704');
INSERT INTO public.admin_users (id, username, email, password, full_name, is_active, created_at, updated_at) VALUES (1, 'dulaj', 'admin@icams.lk', '$2b$10$1u6W5aChgG7bvAgl4T9eQ.mClnX9FIOGE1FsSyxtZZEofAoBP906i', 'System Administrator', true, '2026-03-27 23:31:06.109921', '2026-03-27 23:31:06.109921');


--
-- TOC entry 5241 (class 0 OID 17296)
-- Dependencies: 234
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status, doctor_notes, created_at, updated_at) VALUES (1, 3, 2, 3, '2026-04-04', '20:00:00', 'I have a neck pain with my right hand. So I need to check it and relieve from this pain.', 'completed', 'Patient added to my regular list', '2026-03-29 22:04:27.378479', '2026-03-29 22:39:41.940968');
INSERT INTO public.appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status, doctor_notes, created_at, updated_at) VALUES (4, 3, 2, 3, '2026-04-06', '13:30:00', 'Right side abd pain', 'completed', NULL, '2026-04-06 11:34:14.618407', '2026-04-06 12:02:51.660683');
INSERT INTO public.appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status, doctor_notes, created_at, updated_at) VALUES (2, 3, 2, 3, '2026-04-04', '16:00:00', 'Meet the doctor for further information.', 'completed', NULL, '2026-04-03 17:14:33.452426', '2026-04-06 12:03:06.870948');
INSERT INTO public.appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status, doctor_notes, created_at, updated_at) VALUES (3, 1, 2, 3, '2026-04-04', '15:30:00', 'Spinal Issues', 'completed', NULL, '2026-04-03 17:17:43.396993', '2026-04-06 12:03:10.719112');
INSERT INTO public.appointments (id, patient_id, doctor_id, hospital_id, appointment_date, appointment_time, reason, status, doctor_notes, created_at, updated_at) VALUES (5, 1, 2, 2, '2026-04-17', '22:30:00', 'To check my Mother''s Neck pain', 'completed', NULL, '2026-04-17 22:21:20.428228', '2026-04-17 22:22:37.579679');


--
-- TOC entry 5251 (class 0 OID 17417)
-- Dependencies: 244
-- Data for Name: clinical_notes; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 5249 (class 0 OID 17400)
-- Dependencies: 242
-- Data for Name: clinical_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (1, 3, 2, 'lab_test', 'Lisinopril (Zestril)', 'ACE inhibitors can cause a dry cough, while diuretics may increase sun sensitivity.', 'pending', '2026-03-31 00:06:11.966157', '2026-03-31 00:06:11.966157');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (2, 3, 2, 'lab_test', 'Lisinopril (Zestril)', 'ACE inhibitors can cause a dry cough, while diuretics may increase sun sensitivity.', 'pending', '2026-03-31 00:11:05.971476', '2026-03-31 00:11:05.971476');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (3, 3, 2, 'lab_test', 'Lisinopril (Zestril)', 'ACE inhibitors can cause a dry cough, while diuretics may increase sun sensitivity.', 'pending', '2026-03-31 00:16:10.664991', '2026-03-31 00:16:10.664991');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (4, 3, 2, 'lab_test', 'Lisinopril (Zestril)', 'ACE inhibitors can cause a dry cough, while diuretics may increase sun sensitivity.', 'pending', '2026-03-31 00:16:10.6667', '2026-03-31 00:16:10.6667');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (5, 3, 2, 'scan', 'Ultra Sound Scan on abdormina;', 'ab02-1', 'pending', '2026-04-02 10:56:53.036189', '2026-04-02 10:56:53.036189');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (6, 3, 2, 'scan', 'USS on right side ab', '', 'pending', '2026-04-04 00:55:22.954928', '2026-04-04 00:55:22.954928');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (7, 3, 2, 'lab_test', 'Blood Kidney test', '', 'pending', '2026-04-06 15:08:05.125864', '2026-04-06 15:08:05.125864');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (8, 1, 2, 'scan', 'CT Scan on Neck ', '', 'pending', '2026-04-17 22:26:17.968743', '2026-04-17 22:26:17.968743');
INSERT INTO public.clinical_orders (id, patient_id, doctor_id, order_type, description, details, status, created_at, updated_at) VALUES (9, 1, 2, 'lab_test', 'CT on whole spinal', '', 'pending', '2026-04-17 22:40:18.496484', '2026-04-17 22:40:18.496484');


--
-- TOC entry 5259 (class 0 OID 17510)
-- Dependencies: 252
-- Data for Name: doctor_ratings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.doctor_ratings (id, patient_id, doctor_id, rating, review, is_reported, report_reason, created_at, updated_at) VALUES (1, 1, 2, 5, 'Friendly and very helpfull.', false, NULL, '2026-04-17 23:49:30.427871', '2026-04-17 23:49:30.427871');
INSERT INTO public.doctor_ratings (id, patient_id, doctor_id, rating, review, is_reported, report_reason, created_at, updated_at) VALUES (4, 3, 2, 4, 'Helped me a lot... Thank you doctor!!', false, NULL, '2026-04-17 23:52:50.774186', '2026-04-17 23:52:50.774186');


--
-- TOC entry 5231 (class 0 OID 17170)
-- Dependencies: 224
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.doctors (id, full_name, email, password, license_number, specialization, years_of_experience, institution_name, registration_number, license_document, hospital_ids, status, created_at, updated_at, avatar) VALUES (1, 'Dinoth Kavinda', 'dinoth@gmail.com', '$2b$10$pu5v6dPt/s6Q0eqm4ulZHuhv1EFQJ6vCx0WKTjBQq3r1AzzqCxUEe', '156846846346', 'neurology', 3, 'Nawaloka Hospital', '246874968', 'uploads\licenses\licenseDocument-1774635323325-239508596.PNG', '{2}', 'ACTIVE', '2026-03-27 23:45:23.62626', '2026-03-27 23:45:50.369914', NULL);
INSERT INTO public.doctors (id, full_name, email, password, license_number, specialization, years_of_experience, institution_name, registration_number, license_document, hospital_ids, status, created_at, updated_at, avatar) VALUES (4, 'John Doe', 'infoicams123@gmail.com', '$2b$10$zTgoyQ8K6gBwrZF8oyH1m.p4dOGvwcyGkUCSK99CpEYTouvsJdqFO', '156846846346', 'neurology', 4, 'Hemas Thalawathugoda', '3546354', 'uploads\licenses\licenseDocument-1775587978484-779210646.JPEG', '{3}', 'REJECTED', '2026-04-08 00:22:58.703565', '2026-04-08 00:31:18.203577', NULL);
INSERT INTO public.doctors (id, full_name, email, password, license_number, specialization, years_of_experience, institution_name, registration_number, license_document, hospital_ids, status, created_at, updated_at, avatar) VALUES (2, 'Chaminda Sandaruwan', 'fitxsports24@gmail.com', '$2b$10$LahTZobTCHVlLJFlI8EJ/eVB1zCq.hr9GwlRR3XxkiKVq4blIugpK', '3500746', 'neurology', 8, 'Kalubowila General Hospital, Hemas Thalawathugoda, Nawaloka Hospital', '2549687468', 'uploads\licenses\licenseDocument-1774800826212-212425157.jpg', '{4,3,2}', 'ACTIVE', '2026-03-29 21:43:46.538084', '2026-04-24 22:53:25.541592', 'https://icams.pandanlabs.net/api/uploads/licenses/avatar-1776449901756-781749728.jpg');


--
-- TOC entry 5239 (class 0 OID 17274)
-- Dependencies: 232
-- Data for Name: health_logs; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (3, 1, 123, 81, 72, 35.00, 98, 'great', '[]', '', '2026-03-29 14:56:45.747973');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (4, 1, 122, 82, 74, 38.00, 97, 'good', '[]', '', '2026-03-30 23:07:19.103443');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (5, 3, 132, 85, 76, 39.00, 94, 'okay', '["Headache", "Fever", "Cough"]', '', '2026-03-30 23:16:21.011651');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (6, 1, 125, 82, 73, 36.00, 99, 'great', '[]', '', '2026-04-02 10:28:41.993835');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (7, 3, 126, 83, 75, 34.00, 96, 'good', '["Headache"]', '', '2026-04-02 10:31:04.317157');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (8, 3, 122, 82, 74, 35.00, 98, 'good', '["Headache"]', '', '2026-04-03 14:34:24.572837');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (9, 1, 122, 81, 73, 35.00, 99, 'good', '["Headache"]', '', '2026-04-03 14:35:34.354149');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (10, 3, 122, 81, 75, 36.00, 99, 'great', '[]', '', '2026-04-06 12:01:31.905386');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (11, 1, 122, 81, 72, 35.00, 98, 'great', '[]', '', '2026-04-06 13:14:42.288759');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (12, 3, 135, 85, 78, 38.00, 92, 'poor', '["Headache", "Cough", "Fatigue"]', '', '2026-04-06 13:39:38.220942');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (13, 3, 145, 88, 79, 39.00, 89, 'poor', '["Headache", "Fever", "Cough", "Nausea"]', '', '2026-04-06 13:40:38.115137');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (14, 1, 122, 86, 73, 35.00, 98, 'great', '[]', '', '2026-04-07 23:11:26.201016');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (15, 3, 135, 85, 74, 36.00, 95, 'okay', '[]', '', '2026-04-07 23:12:29.466587');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (16, 3, 122, 82, 71, 35.00, 99, 'good', '["Headache"]', '', '2026-04-11 22:05:58.660825');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (17, 1, 125, 88, 75, 35.00, 96, 'good', '["Headache"]', '', '2026-04-11 22:16:42.60801');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (18, 3, 123, 82, 74, 37.00, 99, 'great', '[]', '', '2026-04-17 22:15:36.14239');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (19, 1, 122, 82, 74, 35.00, 99, 'great', '[]', '', '2026-04-17 22:19:17.012159');
INSERT INTO public.health_logs (id, patient_id, systolic_bp, diastolic_bp, heart_rate, temperature, oxygen_level, mood, symptoms, notes, created_at) VALUES (20, 3, 122, 81, 73, 36.00, 99, 'great', '[]', '', '2026-04-24 22:39:17.852027');


--
-- TOC entry 5229 (class 0 OID 17149)
-- Dependencies: 222
-- Data for Name: hospitals; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.hospitals (id, name, email, password, registration_number, address, phone, type, specialties, status, created_at, updated_at) VALUES (2, 'Nawaloka Hospital', 'nawaloka@gmail.com', '$2b$10$qWRNBeO.GVXTT75Ftz7xaOEv6Ulq6Jnq64jAJBMQa0w0.sXsoUGuG', 'H-001', 'Kollupitiya, Colombo', '0756985698', 'Private', '{Cardiology,Neurology}', 'ACTIVE', '2026-03-27 23:38:57.43256', '2026-03-27 23:38:57.43256');
INSERT INTO public.hospitals (id, name, email, password, registration_number, address, phone, type, specialties, status, created_at, updated_at) VALUES (3, 'Hemas Thalawathugoda', 'hemasT@gmail.com', '$2b$10$Q9PTogq0ewGvbyuWVXr13OT1SEQPWaRjZ4gNTAj0bg/c4lGsAhsX6', 'h-002', '17, Pannipitya Road', '0758932569', 'Private', '{Cardiology,Neurology,Dermotology,Endocrinology}', 'ACTIVE', '2026-03-29 21:38:52.636877', '2026-03-29 21:38:52.636877');
INSERT INTO public.hospitals (id, name, email, password, registration_number, address, phone, type, specialties, status, created_at, updated_at) VALUES (4, 'Kalubowila General Hospital', 'kalubowila@gmail.com', '$2b$10$It23x6c9KGnU7Gbi0A532uIygQYAz2WoFs4CKUT5l89UVg.5c8DWW', 'h-003', '15/1, Kalubowila, Colombo', '074562589', 'Government', '{Neurology,Cardiology,Dermatology}', 'ACTIVE', '2026-03-29 21:40:58.177495', '2026-03-29 21:40:58.177495');
INSERT INTO public.hospitals (id, name, email, password, registration_number, address, phone, type, specialties, status, created_at, updated_at) VALUES (5, 'Medihelp Hospital - Piliyandala', 'medihelpPili@gmail.com', '$2b$10$ojQLspFoP8sqtu397FwdBOqJxfh0mmiwX8C3ODd.F8IuRI8xfDb6S', 'HO004', '12,1, Piliyandala', '0756654463', 'Private', '{Cardiology,Neurology}', 'ACTIVE', '2026-04-11 22:59:21.773127', '2026-04-11 22:59:21.773127');


--
-- TOC entry 5243 (class 0 OID 17330)
-- Dependencies: 236
-- Data for Name: lab_results; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.lab_results (id, patient_id, hospital_id, doctor_id, test_name, test_type, result_summary, result_data, file_url, status, collected_at, created_at, nurse_id, review_note) VALUES (10, 3, NULL, 2, 'FBC', 'blood', 'No Major critical findings', NULL, 'https://icams.pandanlabs.net/api/uploads/profiles/profile_picture-1775155499198-825381215.JPEG', 'reviewed', '2026-04-03 00:14:59.436459', '2026-04-03 00:12:47.161619', 2, '');
INSERT INTO public.lab_results (id, patient_id, hospital_id, doctor_id, test_name, test_type, result_summary, result_data, file_url, status, collected_at, created_at, nurse_id, review_note) VALUES (11, 3, 4, 2, 'USS on right abd', 'Radiology Scan', 'A 0.33cm st found on right kidney ', NULL, 'https://icams.pandanlabs.net/api/uploads/profiles/profile_picture-1775457300270-734533698.JPEG', 'ready', '2026-04-06 12:05:00.942639', '2026-04-04 01:42:25.762185', 2, NULL);
INSERT INTO public.lab_results (id, patient_id, hospital_id, doctor_id, test_name, test_type, result_summary, result_data, file_url, status, collected_at, created_at, nurse_id, review_note) VALUES (12, 3, 4, 2, 'Kidney Blood Test', 'Laboratory Test', 'found 0.003cm ', NULL, 'https://icams.pandanlabs.net/api/uploads/profiles/profile_picture-1775468524791-489137191.JPEG', 'ready', '2026-04-06 15:12:05.010992', '2026-04-06 15:10:22.651191', 2, NULL);
INSERT INTO public.lab_results (id, patient_id, hospital_id, doctor_id, test_name, test_type, result_summary, result_data, file_url, status, collected_at, created_at, nurse_id, review_note) VALUES (13, 1, 2, 2, 'CT on right neck', 'scan', NULL, NULL, NULL, 'processing', NULL, '2026-04-17 22:43:04.919275', NULL, NULL);


--
-- TOC entry 5245 (class 0 OID 17362)
-- Dependencies: 238
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (4, 2, 'doctor', 3, 'patient', 'Hello Charukshi! How are you feeling now?', true, '2026-04-02 10:40:58.550089');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (6, 2, 'doctor', 3, 'patient', 'Okay Charukshi, Update your nurse if anything changed', true, '2026-04-02 10:50:52.455031');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (14, 3, 'patient', 2, 'doctor', 'hi doc', false, '2026-04-11 23:52:21.111375');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (15, 1, 'patient', 1, 'nurse', 'Hi Nurse', false, '2026-04-17 22:44:20.154869');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (3, 2, 'hospital', 1, 'patient', 'Hello Mr! How can We help?', true, '2026-03-31 00:53:06.71494');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (2, 1, 'patient', 2, 'hospital', 'Hello! ', true, '2026-03-31 00:52:22.496084');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (1, 1, 'patient', 3, 'hospital', 'Hello! ', true, '2026-03-31 00:51:44.723319');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (12, 3, 'hospital', 1, 'patient', 'How can we help?', true, '2026-04-03 00:34:41.18771');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (5, 3, 'patient', 2, 'doctor', 'Now im feeling a bit good doc.', true, '2026-04-02 10:41:39.805791');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (7, 3, 'patient', 2, 'doctor', 'Okay doc', true, '2026-04-02 10:51:17.681242');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (8, 3, 'patient', 2, 'nurse', 'Hello!!', true, '2026-04-02 10:51:28.234756');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (10, 3, 'patient', 2, 'nurse', 'Yes mss', true, '2026-04-03 00:13:21.780205');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (13, 3, 'patient', 2, 'nurse', 'yes I saw that', false, '2026-04-11 22:06:16.845672');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (9, 2, 'nurse', 3, 'patient', 'Hello Charu! How are you now I see there is a progress', true, '2026-04-02 10:51:56.955494');
INSERT INTO public.messages (id, sender_id, sender_role, receiver_id, receiver_role, message_text, is_read, created_at) VALUES (11, 2, 'nurse', 3, 'patient', 'Yes your fbc is also normal', true, '2026-04-03 00:28:44.660308');


--
-- TOC entry 5247 (class 0 OID 17379)
-- Dependencies: 240
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (2, 2, 'doctor', 'Appointment Pending Your Confirmation', 'Hospital has approved a request for Sat Apr 04 2026 00:00:00 GMT+0530 (India Standard Time). Please confirm.', 'info', false, '2026-03-29 22:12:28.344704');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (5, 1, 'nurse', 'New Patient Assigned', 'Dr. Your Doctor has assigned you to care for Dulaj Dulsith.', 'info', false, '2026-03-29 23:44:49.784075');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (7, 2, 'doctor', 'Critical Condition Alert: High Fever', 'Patient Charukshi Wijesinghe''s vitals have exceeded thresholds: BP 132/85, HR 76, O2 94%, Temp 39°C.', 'critical', false, '2026-03-30 23:16:21.054621');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (6, 3, 'patient', 'Critical Condition Alert: High Fever', 'Your vitals indicate a critical condition. Your care team has been notified.', 'critical', true, '2026-03-30 23:16:21.050174');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (4, 3, 'patient', 'Registration Approved', 'Your doctor has approved your registration. You are now being monitored.', 'info', true, '2026-03-29 22:39:41.704977');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (3, 3, 'patient', 'Appointment Fully Confirmed', 'Dr. Sarah has confirmed your meeting on Sat Apr 04 2026 00:00:00 GMT+0530 (India Standard Time).', 'info', true, '2026-03-29 22:13:01.200368');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (32, 1, 'patient', 'Official Lab Order', 'Dr. Your Doctor has ordered a CT on right neck (scan).', 'info', false, '2026-04-17 22:43:04.970369');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (9, 2, 'nurse', 'New Lab Request', 'Doctor has ordered a FBC (blood) for your assigned patient.', 'info', true, '2026-04-03 00:12:47.186965');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (33, 1, 'nurse', 'New Lab Request', 'Doctor has ordered a CT on right neck (scan) for Dulaj Dulsith.', 'info', false, '2026-04-17 22:43:05.000125');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (8, 2, 'nurse', 'New Patient Assigned', 'Dr. Your Doctor has assigned you to care for Charukshi Wijesinghe.', 'info', true, '2026-03-31 00:02:16.381196');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (1, 1, 'patient', 'Registration Approved', 'Your doctor has approved your registration. You are now being monitored.', 'info', true, '2026-03-27 23:49:55.705062');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (10, 3, 'hospital', 'New Appointment Booking', 'Patient has requested a consultation at your facility for 2026-04-04.', 'info', false, '2026-04-03 17:14:33.502312');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (11, 3, 'hospital', 'New Appointment Booking', 'Patient has requested a consultation at your facility for 2026-04-04.', 'info', false, '2026-04-03 17:17:43.420038');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (12, 2, 'doctor', 'Appointment Pending Your Confirmation', 'Hospital has approved a request for 2026-04-04. Please confirm.', 'info', false, '2026-04-03 17:43:33.389121');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (13, 2, 'doctor', 'Appointment Pending Your Confirmation', 'Hospital has approved a request for 2026-04-04. Please confirm.', 'info', false, '2026-04-03 17:43:34.542147');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (15, 1, 'patient', 'Appointment Fully Confirmed', 'Dr. Sarah has confirmed your meeting on 2026-04-04.', 'info', false, '2026-04-03 17:44:48.345114');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (14, 3, 'patient', 'Appointment Fully Confirmed', 'Dr. Sarah has confirmed your meeting on 2026-04-04.', 'info', true, '2026-04-03 17:44:01.342595');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (16, 2, 'nurse', 'New Lab Request', 'Doctor has ordered a USS on right abd (Radiology Scan) for your assigned patient.', 'info', false, '2026-04-04 01:42:25.97649');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (17, 3, 'hospital', 'New Appointment Booking', 'Patient has requested a consultation at your facility for 2026-04-06.', 'info', false, '2026-04-06 11:34:14.74242');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (18, 2, 'doctor', 'Appointment Pending Your Confirmation', 'Hospital has approved a request for 2026-04-06. Please confirm.', 'info', false, '2026-04-06 12:02:02.347696');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (21, 2, 'doctor', 'Critical Condition Alert: Hypoxia, High Fever', 'Patient Charukshi Wijesinghe''s vitals have exceeded thresholds: BP 145/88, HR 79, O2 89%, Temp 39°C.', 'critical', false, '2026-04-06 13:40:38.275367');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (22, 2, 'nurse', 'Critical Condition Alert: Hypoxia, High Fever', 'Patient Charukshi Wijesinghe''s vitals have exceeded thresholds: BP 145/88, HR 79, O2 89%, Temp 39°C.', 'critical', false, '2026-04-06 13:40:38.29489');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (23, 2, 'nurse', 'New Lab Request', 'Doctor has ordered a Kidney Blood Test (Laboratory Test) for your assigned patient.', 'info', false, '2026-04-06 15:10:22.794751');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (20, 3, 'patient', 'Critical Condition Alert: Hypoxia, High Fever', 'Your vitals indicate a critical condition. Your care team has been notified.', 'critical', true, '2026-04-06 13:40:38.26301');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (19, 3, 'patient', 'Appointment Fully Confirmed', 'Dr. Sarah has confirmed your meeting on 2026-04-06.', 'info', true, '2026-04-06 12:02:36.411722');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (24, 2, 'hospital', 'New Appointment Booking', 'Patient has requested a consultation at your facility for 2026-04-17.', 'info', false, '2026-04-17 22:21:20.509993');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (26, 1, 'patient', 'Appointment Fully Confirmed', 'Dr. Sarah has confirmed your meeting on 2026-04-17.', 'info', false, '2026-04-17 22:22:20.872005');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (27, 1, 'patient', 'Appointment Fully Confirmed', 'Dr. Sarah has confirmed your meeting on 2026-04-17.', 'info', false, '2026-04-17 22:22:25.604534');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (28, 1, 'patient', 'Registration Approved', 'Your doctor has approved your registration. You are now being monitored.', 'info', false, '2026-04-17 22:22:37.53162');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (29, 1, 'nurse', 'New Patient Assigned', 'Dr. Your Doctor has assigned you to care for Dulaj Dulsith.', 'info', false, '2026-04-17 22:23:41.208625');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (25, 2, 'doctor', 'Appointment Pending Your Confirmation', 'Hospital has approved a request for 2026-04-17. Please confirm.', 'info', true, '2026-04-17 22:21:43.237505');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (30, 1, 'patient', 'New Care Order', 'Dr. Your Doctor has issued a new lab test: CT on whole spinal', 'order', false, '2026-04-17 22:40:18.527268');
INSERT INTO public.notifications (id, user_id, user_role, title, message, type, is_read, created_at) VALUES (31, 1, 'nurse', 'Direct Care Directive', 'New lab test for Dulaj Dulsith: CT on whole spinal', 'order', true, '2026-04-17 22:40:18.530903');


--
-- TOC entry 5253 (class 0 OID 17431)
-- Dependencies: 246
-- Data for Name: nurse_reports; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.nurse_reports (id, patient_id, nurse_id, title, summary, recommendations, steps, vitals_snapshot, created_at) VALUES (1, 3, 2, 'End-of-Shift Care Report - Apr 2', 'Lisinopril (Zestril) delivered', '', '[{"title": "Vitals Monitoring", "completed": false, "description": ""}, {"title": "Medication Delivery", "completed": true, "description": ""}, {"title": "Patient Meal Assistance", "completed": false, "description": ""}, {"title": "Personal Hygiene", "completed": false, "description": ""}]', '{"bp": "126/83", "hr": 75, "spo2": 96, "temp": "34.00"}', '2026-04-02 11:22:12.817559');


--
-- TOC entry 5233 (class 0 OID 17193)
-- Dependencies: 226
-- Data for Name: nurses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.nurses (id, full_name, email, password, license_number, qualification, years_of_experience, institution_name, registration_number, license_document, hospital_ids, status, created_at, updated_at, avatar) VALUES (1, 'Amanda Wijesinghe', 'amanda@gmail.com', '$2b$10$H/yykRFB5D4dW/aRVLDoKuwLshwDOM5G.erCq5a2itCXCiSIY.UYK', '325463874687', 'rn', 0, 'Nawaloka Hospital', '3546354', 'uploads\licenses\licenseDocument-1774635411696-261473001.PNG', '{2}', 'ACTIVE', '2026-03-27 23:46:51.9595', '2026-03-27 23:47:02.438905', NULL);
INSERT INTO public.nurses (id, full_name, email, password, license_number, qualification, years_of_experience, institution_name, registration_number, license_document, hospital_ids, status, created_at, updated_at, avatar) VALUES (3, 'Gihara Perera', 'gihara@gmail.com', '$2b$10$v2YZFuDixUrBOH8pdjLJeO3bp.PCjP.MQKSCAYwzdpR.bhXwzG24K', '25465465465', 'lpn', 2, 'Hemas Thalawathugoda, Kalubowila General Hospital, Nawaloka Hospital', '324654', 'uploads\licenses\licenseDocument-1774894576185-326789117.JPEG', '{3,4,2}', 'ACTIVE', '2026-03-30 23:46:16.919192', '2026-03-30 23:46:34.892564', NULL);
INSERT INTO public.nurses (id, full_name, email, password, license_number, qualification, years_of_experience, institution_name, registration_number, license_document, hospital_ids, status, created_at, updated_at, avatar) VALUES (2, 'Harshi Perera', 'spotifyanupa@gmail.com', '$2b$10$BydjV945jGdk0n0R6/eU8OjF/mj7NlSVzZKh4raJqIxPZ9HJvzWqu', '2547685765', 'bscn', 5, 'Hemas Thalawathugoda, Kalubowila General Hospital, Nawaloka Hospital', '254654654', 'uploads\licenses\licenseDocument-1774800888579-11672838.JPEG', '{3,4,2}', 'ACTIVE', '2026-03-29 21:44:48.911823', '2026-04-24 22:53:57.642353', NULL);


--
-- TOC entry 5257 (class 0 OID 17489)
-- Dependencies: 250
-- Data for Name: nursing_task_steps; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (1, 4, 'Order Received', 'completed', '2026-04-04 00:16:27.158786', 'Step completed by nurse', 0);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (3, 4, 'Transport to Radiology', 'completed', '2026-04-04 00:16:55.615532', 'Step completed by nurse', 2);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (5, 4, 'Return to Ward', 'completed', '2026-04-04 00:16:56.79354', 'Step completed by nurse', 4);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (2, 4, 'Pre-procedural Prep', 'completed', '2026-04-04 00:16:58.437755', 'Step completed by nurse', 1);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (4, 4, 'Scan in Progress', 'completed', '2026-04-04 00:16:59.512165', 'Step completed by nurse', 3);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (6, 4, 'Results Uploaded', 'completed', '2026-04-04 00:17:00.990801', 'Step completed by nurse', 5);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (7, 5, 'Order Received', 'completed', '2026-04-04 01:43:12.775208', 'Step completed by nurse', 0);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (9, 5, 'Transport to Radiology', 'completed', '2026-04-04 01:43:15.065986', 'Step completed by nurse', 2);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (11, 5, 'Return to Ward', 'completed', '2026-04-04 01:43:52.517769', 'Step completed by nurse', 4);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (8, 5, 'Pre-procedural Prep', 'completed', '2026-04-04 01:43:53.506599', 'Step completed by nurse', 1);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (10, 5, 'Scan in Progress', 'completed', '2026-04-04 01:43:53.962532', 'Step completed by nurse', 3);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (12, 5, 'Results Uploaded', 'completed', '2026-04-04 01:43:54.951069', 'Step completed by nurse', 5);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (13, 6, 'Order Received', 'completed', '2026-04-06 15:10:54.613572', 'Step completed by nurse', 0);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (14, 6, 'Pre-procedural Prep', 'completed', '2026-04-06 15:10:55.63786', 'Step completed by nurse', 1);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (15, 6, 'Transport to Radiology', 'completed', '2026-04-06 15:10:56.372665', 'Step completed by nurse', 2);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (16, 6, 'Scan in Progress', 'completed', '2026-04-06 15:10:57.041148', 'Step completed by nurse', 3);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (17, 6, 'Return to Ward', 'completed', '2026-04-06 15:10:58.552656', 'Step completed by nurse', 4);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (18, 6, 'Results Uploaded', 'completed', '2026-04-06 15:10:59.644687', 'Step completed by nurse', 5);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (19, 7, 'Order Received', 'pending', NULL, NULL, 0);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (20, 7, 'Pre-procedural Prep', 'pending', NULL, NULL, 1);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (21, 7, 'Transport to Radiology', 'pending', NULL, NULL, 2);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (22, 7, 'Scan in Progress', 'pending', NULL, NULL, 3);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (23, 7, 'Return to Ward', 'pending', NULL, NULL, 4);
INSERT INTO public.nursing_task_steps (id, task_id, step_name, status, completed_at, notes, sort_order) VALUES (24, 7, 'Results Uploaded', 'pending', NULL, NULL, 5);


--
-- TOC entry 5255 (class 0 OID 17453)
-- Dependencies: 248
-- Data for Name: nursing_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.nursing_tasks (id, title, task_type, patient_id, nurse_id, doctor_id, hospital_id, status, current_step, created_at, updated_at, result_summary, result_file, lab_test_id) VALUES (4, 'Abdorminal CT Scan', 'Radiology Scan', 3, 2, 2, 3, 'completed', 6, '2026-04-04 00:07:45.386137', '2026-04-04 00:17:02.559009', NULL, NULL, NULL);
INSERT INTO public.nursing_tasks (id, title, task_type, patient_id, nurse_id, doctor_id, hospital_id, status, current_step, created_at, updated_at, result_summary, result_file, lab_test_id) VALUES (5, 'USS on right abd', 'Radiology Scan', 3, 2, 2, 3, 'completed', 6, '2026-04-04 01:43:04.427126', '2026-04-04 01:43:54.956085', NULL, NULL, 11);
INSERT INTO public.nursing_tasks (id, title, task_type, patient_id, nurse_id, doctor_id, hospital_id, status, current_step, created_at, updated_at, result_summary, result_file, lab_test_id) VALUES (6, 'Kidney Test', 'Radiology Scan', 3, 2, NULL, 3, 'completed', 6, '2026-04-06 15:10:51.124386', '2026-04-06 15:10:59.649236', NULL, NULL, NULL);
INSERT INTO public.nursing_tasks (id, title, task_type, patient_id, nurse_id, doctor_id, hospital_id, status, current_step, created_at, updated_at, result_summary, result_file, lab_test_id) VALUES (7, 'CT on right neck', 'Radiology Scan', 1, 1, 2, 2, 'pending', 0, '2026-04-17 22:43:40.748113', '2026-04-17 22:43:40.748113', NULL, NULL, 13);


--
-- TOC entry 5237 (class 0 OID 17245)
-- Dependencies: 230
-- Data for Name: patient_nurse_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.patient_nurse_assignments (id, patient_id, nurse_id, assigned_by, created_at) VALUES (1, 1, 1, 1, '2026-03-29 23:44:49.748974');
INSERT INTO public.patient_nurse_assignments (id, patient_id, nurse_id, assigned_by, created_at) VALUES (2, 3, 2, 2, '2026-03-31 00:02:16.284842');


--
-- TOC entry 5235 (class 0 OID 17216)
-- Dependencies: 228
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.patients (id, full_name, email, password, hospital_id, doctor_id, status, condition, created_at, updated_at, last_vital_check, phone, age, gender, address, profile_picture) VALUES (3, 'Charukshi Wijesinghe', 'antifor96@gmail.com', '$2b$10$ybdGqxMB/awDR5y4gkg1x.kwV5R4nt06sxD6mN8T50l536H/hW/ou', NULL, 2, 'ACTIVE', 'monitoring', '2026-03-29 21:42:28.609948', '2026-04-07 23:12:29.50187', NULL, '+94 71 234 5678', 31, 'Female', 'Gorakapitiya,Piliyandala', 'https://icams.pandanlabs.net/api/uploads/profiles/profile_picture-1775108957181-229289218.jpg');
INSERT INTO public.patients (id, full_name, email, password, hospital_id, doctor_id, status, condition, created_at, updated_at, last_vital_check, phone, age, gender, address, profile_picture) VALUES (4, 'Pandan', 'connect.pandanlabs@gmail.com', '$2b$10$VqOiUGkP9riTemOESzEB/OLSMZi.UQ5IoyugETV/qP8dugeCm6cT2', NULL, NULL, 'ACTIVE', 'stable', '2026-04-07 23:42:56.285723', '2026-04-07 23:42:56.285723', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patients (id, full_name, email, password, hospital_id, doctor_id, status, condition, created_at, updated_at, last_vital_check, phone, age, gender, address, profile_picture) VALUES (5, 'UDAD Wijesinghe', 'amandawijesinghe2001@gmail.com', '$2b$10$HnEPlU8yynmompu97EQOheaI.l.V4rxKTqtS5NsfrbLhCCVbogCcC', NULL, NULL, 'ACTIVE', 'stable', '2026-04-08 00:03:27.002042', '2026-04-08 00:03:27.002042', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patients (id, full_name, email, password, hospital_id, doctor_id, status, condition, created_at, updated_at, last_vital_check, phone, age, gender, address, profile_picture) VALUES (2, 'Visal Wikumsara', 'visal@gmail.com', '$2b$10$jwSfCdXm./AhStZX22A43OtzLhQHwu8m7UOjptTfmr7PHVd.mcqgq', NULL, NULL, 'ACTIVE', 'stable', '2026-03-29 21:41:45.772203', '2026-04-11 22:41:59.193636', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.patients (id, full_name, email, password, hospital_id, doctor_id, status, condition, created_at, updated_at, last_vital_check, phone, age, gender, address, profile_picture) VALUES (1, 'Dulaj Dulsith', 'dulaj.dulsith@gmail.com', '$2b$10$DG9G10ylYVlJjc2m0WsFC.4LK8Oxb22QKak7On878Daywc/ZW4h86', 2, 2, 'ACTIVE', 'monitoring', '2026-03-27 23:47:39.388956', '2026-04-17 22:22:37.530646', NULL, NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 5261 (class 0 OID 17539)
-- Dependencies: 254
-- Data for Name: platform_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.platform_reviews (id, user_id, user_role, user_name, user_avatar, rating, review_text, is_featured, created_at) VALUES (1, 3, 'patient', 'Charukshi Wijesinghe', 'https://icams.pandanlabs.net/api/uploads/profiles/profile_picture-1775108957181-229289218.jpg', 4, 'Really helpfull and user friendly!!!!!', true, '2026-04-18 00:17:03.888338');
INSERT INTO public.platform_reviews (id, user_id, user_role, user_name, user_avatar, rating, review_text, is_featured, created_at) VALUES (2, 1, 'patient', 'Dulaj Dulsith', NULL, 5, 'Good Platfrom. Usefull for store our all health updates.', true, '2026-04-18 00:19:08.692594');
INSERT INTO public.platform_reviews (id, user_id, user_role, user_name, user_avatar, rating, review_text, is_featured, created_at) VALUES (3, 2, 'patient', 'Visal Wikumsara', NULL, 4, 'Helped me to found the doctor now who is monitoring me. Usefull to connect with nurses and doctors. Thank you!', true, '2026-04-18 00:21:22.988812');
INSERT INTO public.platform_reviews (id, user_id, user_role, user_name, user_avatar, rating, review_text, is_featured, created_at) VALUES (4, 1, 'nurse', 'Amanda Wijesinghe', NULL, 5, 'Learned a lot with doctors and Patients.', true, '2026-04-18 00:22:16.530597');
INSERT INTO public.platform_reviews (id, user_id, user_role, user_name, user_avatar, rating, review_text, is_featured, created_at) VALUES (6, 2, 'doctor', 'Chaminda Sandaruwan', 'https://icams.pandanlabs.net/api/uploads/licenses/avatar-1776449901756-781749728.jpg', 5, 'As a Doctor, I think this is the best application on the island to monitor a patient with handeling their health records with support of nurses. So I''m highly recommending patients to use this to connect with us. Thank you.', true, '2026-04-18 00:25:51.241167');
INSERT INTO public.platform_reviews (id, user_id, user_role, user_name, user_avatar, rating, review_text, is_featured, created_at) VALUES (5, 2, 'nurse', 'Harshi Perera', NULL, 4, 'Gained more experince about healthcare digitalizaion and interactions with patients and doctors.', true, '2026-04-18 00:23:48.167252');


--
-- TOC entry 5285 (class 0 OID 0)
-- Dependencies: 219
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 2, true);


--
-- TOC entry 5286 (class 0 OID 0)
-- Dependencies: 233
-- Name: appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.appointments_id_seq', 5, true);


--
-- TOC entry 5287 (class 0 OID 0)
-- Dependencies: 243
-- Name: clinical_notes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clinical_notes_id_seq', 1, false);


--
-- TOC entry 5288 (class 0 OID 0)
-- Dependencies: 241
-- Name: clinical_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clinical_orders_id_seq', 9, true);


--
-- TOC entry 5289 (class 0 OID 0)
-- Dependencies: 251
-- Name: doctor_ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctor_ratings_id_seq', 4, true);


--
-- TOC entry 5290 (class 0 OID 0)
-- Dependencies: 223
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.doctors_id_seq', 4, true);


--
-- TOC entry 5291 (class 0 OID 0)
-- Dependencies: 231
-- Name: health_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.health_logs_id_seq', 20, true);


--
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 221
-- Name: hospitals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.hospitals_id_seq', 5, true);


--
-- TOC entry 5293 (class 0 OID 0)
-- Dependencies: 235
-- Name: lab_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lab_results_id_seq', 13, true);


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 237
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 15, true);


--
-- TOC entry 5295 (class 0 OID 0)
-- Dependencies: 239
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 33, true);


--
-- TOC entry 5296 (class 0 OID 0)
-- Dependencies: 245
-- Name: nurse_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nurse_reports_id_seq', 1, true);


--
-- TOC entry 5297 (class 0 OID 0)
-- Dependencies: 225
-- Name: nurses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nurses_id_seq', 4, true);


--
-- TOC entry 5298 (class 0 OID 0)
-- Dependencies: 249
-- Name: nursing_task_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nursing_task_steps_id_seq', 24, true);


--
-- TOC entry 5299 (class 0 OID 0)
-- Dependencies: 247
-- Name: nursing_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.nursing_tasks_id_seq', 7, true);


--
-- TOC entry 5300 (class 0 OID 0)
-- Dependencies: 229
-- Name: patient_nurse_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patient_nurse_assignments_id_seq', 3, true);


--
-- TOC entry 5301 (class 0 OID 0)
-- Dependencies: 227
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.patients_id_seq', 5, true);


--
-- TOC entry 5302 (class 0 OID 0)
-- Dependencies: 253
-- Name: platform_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.platform_reviews_id_seq', 6, true);


--
-- TOC entry 5008 (class 2606 OID 17147)
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- TOC entry 5010 (class 2606 OID 17143)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 17145)
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- TOC entry 5036 (class 2606 OID 17313)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 17429)
-- Name: clinical_notes clinical_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_notes
    ADD CONSTRAINT clinical_notes_pkey PRIMARY KEY (id);


--
-- TOC entry 5044 (class 2606 OID 17415)
-- Name: clinical_orders clinical_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinical_orders
    ADD CONSTRAINT clinical_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5054 (class 2606 OID 17527)
-- Name: doctor_ratings doctor_ratings_patient_id_doctor_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_ratings
    ADD CONSTRAINT doctor_ratings_patient_id_doctor_id_key UNIQUE (patient_id, doctor_id);


--
-- TOC entry 5056 (class 2606 OID 17525)
-- Name: doctor_ratings doctor_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_ratings
    ADD CONSTRAINT doctor_ratings_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 2606 OID 17191)
-- Name: doctors doctors_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_email_key UNIQUE (email);


--
-- TOC entry 5020 (class 2606 OID 17189)
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 17289)
-- Name: health_logs health_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_logs
    ADD CONSTRAINT health_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 17168)
-- Name: hospitals hospitals_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_email_key UNIQUE (email);


--
-- TOC entry 5016 (class 2606 OID 17166)
-- Name: hospitals hospitals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hospitals
    ADD CONSTRAINT hospitals_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 17345)
-- Name: lab_results lab_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 17377)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 17394)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 17446)
-- Name: nurse_reports nurse_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nurse_reports
    ADD CONSTRAINT nurse_reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 17214)
-- Name: nurses nurses_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nurses
    ADD CONSTRAINT nurses_email_key UNIQUE (email);


--
-- TOC entry 5024 (class 2606 OID 17212)
-- Name: nurses nurses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nurses
    ADD CONSTRAINT nurses_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 17501)
-- Name: nursing_task_steps nursing_task_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_task_steps
    ADD CONSTRAINT nursing_task_steps_pkey PRIMARY KEY (id);


--
-- TOC entry 5050 (class 2606 OID 17467)
-- Name: nursing_tasks nursing_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_tasks
    ADD CONSTRAINT nursing_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 5030 (class 2606 OID 17257)
-- Name: patient_nurse_assignments patient_nurse_assignments_patient_id_nurse_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_nurse_assignments
    ADD CONSTRAINT patient_nurse_assignments_patient_id_nurse_id_key UNIQUE (patient_id, nurse_id);


--
-- TOC entry 5032 (class 2606 OID 17255)
-- Name: patient_nurse_assignments patient_nurse_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_nurse_assignments
    ADD CONSTRAINT patient_nurse_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 17233)
-- Name: patients patients_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_key UNIQUE (email);


--
-- TOC entry 5028 (class 2606 OID 17231)
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 17555)
-- Name: platform_reviews platform_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_reviews
    ADD CONSTRAINT platform_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 17319)
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 17324)
-- Name: appointments appointments_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 17314)
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 5077 (class 2606 OID 17533)
-- Name: doctor_ratings doctor_ratings_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_ratings
    ADD CONSTRAINT doctor_ratings_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- TOC entry 5078 (class 2606 OID 17528)
-- Name: doctor_ratings doctor_ratings_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doctor_ratings
    ADD CONSTRAINT doctor_ratings_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 5064 (class 2606 OID 17290)
-- Name: health_logs health_logs_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_logs
    ADD CONSTRAINT health_logs_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 5068 (class 2606 OID 17356)
-- Name: lab_results lab_results_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;


--
-- TOC entry 5069 (class 2606 OID 17351)
-- Name: lab_results lab_results_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;


--
-- TOC entry 5070 (class 2606 OID 17447)
-- Name: lab_results lab_results_nurse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_nurse_id_fkey FOREIGN KEY (nurse_id) REFERENCES public.nurses(id) ON DELETE SET NULL;


--
-- TOC entry 5071 (class 2606 OID 17346)
-- Name: lab_results lab_results_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lab_results
    ADD CONSTRAINT lab_results_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 5076 (class 2606 OID 17502)
-- Name: nursing_task_steps nursing_task_steps_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_task_steps
    ADD CONSTRAINT nursing_task_steps_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.nursing_tasks(id) ON DELETE CASCADE;


--
-- TOC entry 5072 (class 2606 OID 17478)
-- Name: nursing_tasks nursing_tasks_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_tasks
    ADD CONSTRAINT nursing_tasks_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;


--
-- TOC entry 5073 (class 2606 OID 17483)
-- Name: nursing_tasks nursing_tasks_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_tasks
    ADD CONSTRAINT nursing_tasks_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE CASCADE;


--
-- TOC entry 5074 (class 2606 OID 17473)
-- Name: nursing_tasks nursing_tasks_nurse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_tasks
    ADD CONSTRAINT nursing_tasks_nurse_id_fkey FOREIGN KEY (nurse_id) REFERENCES public.nurses(id) ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 17468)
-- Name: nursing_tasks nursing_tasks_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nursing_tasks
    ADD CONSTRAINT nursing_tasks_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 5061 (class 2606 OID 17268)
-- Name: patient_nurse_assignments patient_nurse_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_nurse_assignments
    ADD CONSTRAINT patient_nurse_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.doctors(id);


--
-- TOC entry 5062 (class 2606 OID 17263)
-- Name: patient_nurse_assignments patient_nurse_assignments_nurse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_nurse_assignments
    ADD CONSTRAINT patient_nurse_assignments_nurse_id_fkey FOREIGN KEY (nurse_id) REFERENCES public.nurses(id) ON DELETE CASCADE;


--
-- TOC entry 5063 (class 2606 OID 17258)
-- Name: patient_nurse_assignments patient_nurse_assignments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patient_nurse_assignments
    ADD CONSTRAINT patient_nurse_assignments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- TOC entry 5059 (class 2606 OID 17239)
-- Name: patients patients_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;


--
-- TOC entry 5060 (class 2606 OID 17234)
-- Name: patients patients_hospital_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id) ON DELETE SET NULL;


-- Completed on 2026-04-25 00:37:57

--
-- PostgreSQL database dump complete
--
