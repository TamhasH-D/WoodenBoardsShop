--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

-- Started on 2025-06-09 06:31:32 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3455 (class 0 OID 24577)
-- Dependencies: 217
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.alembic_version (version_num) FROM stdin;
935c8910b92e
\.


--
-- TOC entry 3456 (class 0 OID 24582)
-- Dependencies: 218
-- Data for Name: buyer; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.buyer (id, keycloak_uuid, is_online, created_at, updated_at, last_activity) FROM stdin;
\.


--
-- TOC entry 3457 (class 0 OID 24590)
-- Dependencies: 219
-- Data for Name: seller; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.seller (id, keycloak_uuid, is_online, created_at, updated_at, last_activity) FROM stdin;
\.


--
-- TOC entry 3460 (class 0 OID 24620)
-- Dependencies: 222
-- Data for Name: chat_thread; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.chat_thread (id, created_at, buyer_id, seller_id) FROM stdin;
\.


--
-- TOC entry 3462 (class 0 OID 24663)
-- Dependencies: 224
-- Data for Name: chat_message; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.chat_message (id, message, is_read_by_buyer, is_read_by_seller, created_at, thread_id, buyer_id, seller_id) FROM stdin;
\.


--
-- TOC entry 3458 (class 0 OID 24598)
-- Dependencies: 220
-- Data for Name: wood_type; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.wood_type (id, neme, description) FROM stdin;
\.


--
-- TOC entry 3461 (class 0 OID 24638)
-- Dependencies: 223
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.product (id, volume, price, title, descrioption, delivery_possible, pickup_location, created_at, updated_at, seller_id, wood_type_id) FROM stdin;
\.


--
-- TOC entry 3463 (class 0 OID 24689)
-- Dependencies: 225
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.image (id, image_path, product_id) FROM stdin;
\.


--
-- TOC entry 3459 (class 0 OID 24607)
-- Dependencies: 221
-- Data for Name: wood_type_price; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.wood_type_price (id, price_per_m3, created_at, wood_type_id) FROM stdin;
\.


--
-- TOC entry 3464 (class 0 OID 24704)
-- Dependencies: 226
-- Data for Name: wooden_board; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.wooden_board (id, height, width, image_id, length, volume, confidence, created_at, updated_at, product_id) FROM stdin;
\.


-- Completed on 2025-06-09 06:31:32 UTC

--
-- PostgreSQL database dump complete
--

