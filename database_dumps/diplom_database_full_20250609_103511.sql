--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

-- Started on 2025-06-09 06:35:11 UTC

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

DROP DATABASE IF EXISTS backend;
--
-- TOC entry 3470 (class 1262 OID 16384)
-- Name: backend; Type: DATABASE; Schema: -; Owner: backend
--

CREATE DATABASE backend WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE backend OWNER TO backend;

\connect backend

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 24577)
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO backend;

--
-- TOC entry 218 (class 1259 OID 24582)
-- Name: buyer; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.buyer (
    id uuid NOT NULL,
    keycloak_uuid uuid NOT NULL,
    is_online boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    last_activity timestamp with time zone NOT NULL
);


ALTER TABLE public.buyer OWNER TO backend;

--
-- TOC entry 224 (class 1259 OID 24663)
-- Name: chat_message; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.chat_message (
    id uuid NOT NULL,
    message character varying NOT NULL,
    is_read_by_buyer boolean NOT NULL,
    is_read_by_seller boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    thread_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    seller_id uuid NOT NULL
);


ALTER TABLE public.chat_message OWNER TO backend;

--
-- TOC entry 222 (class 1259 OID 24620)
-- Name: chat_thread; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.chat_thread (
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    buyer_id uuid NOT NULL,
    seller_id uuid NOT NULL
);


ALTER TABLE public.chat_thread OWNER TO backend;

--
-- TOC entry 225 (class 1259 OID 24689)
-- Name: image; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.image (
    id uuid NOT NULL,
    image_path character varying NOT NULL,
    product_id uuid NOT NULL
);


ALTER TABLE public.image OWNER TO backend;

--
-- TOC entry 223 (class 1259 OID 24638)
-- Name: product; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.product (
    id uuid NOT NULL,
    volume double precision NOT NULL,
    price double precision NOT NULL,
    title character varying NOT NULL,
    descrioption character varying,
    delivery_possible boolean NOT NULL,
    pickup_location character varying,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    seller_id uuid NOT NULL,
    wood_type_id uuid NOT NULL
);


ALTER TABLE public.product OWNER TO backend;

--
-- TOC entry 219 (class 1259 OID 24590)
-- Name: seller; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.seller (
    id uuid NOT NULL,
    keycloak_uuid uuid NOT NULL,
    is_online boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    last_activity timestamp with time zone NOT NULL
);


ALTER TABLE public.seller OWNER TO backend;

--
-- TOC entry 220 (class 1259 OID 24598)
-- Name: wood_type; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.wood_type (
    id uuid NOT NULL,
    neme character varying NOT NULL,
    description character varying
);


ALTER TABLE public.wood_type OWNER TO backend;

--
-- TOC entry 221 (class 1259 OID 24607)
-- Name: wood_type_price; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.wood_type_price (
    id uuid NOT NULL,
    price_per_m3 double precision NOT NULL,
    created_at timestamp with time zone NOT NULL,
    wood_type_id uuid NOT NULL
);


ALTER TABLE public.wood_type_price OWNER TO backend;

--
-- TOC entry 226 (class 1259 OID 24704)
-- Name: wooden_board; Type: TABLE; Schema: public; Owner: backend
--

CREATE TABLE public.wooden_board (
    id uuid NOT NULL,
    height double precision NOT NULL,
    width double precision NOT NULL,
    image_id uuid NOT NULL,
    length double precision NOT NULL,
    volume double precision NOT NULL,
    confidence double precision NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    product_id uuid NOT NULL
);


ALTER TABLE public.wooden_board OWNER TO backend;

--
-- TOC entry 3471 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN wooden_board.height; Type: COMMENT; Schema: public; Owner: backend
--

COMMENT ON COLUMN public.wooden_board.height IS 'Height in meters';


--
-- TOC entry 3472 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN wooden_board.width; Type: COMMENT; Schema: public; Owner: backend
--

COMMENT ON COLUMN public.wooden_board.width IS 'Width in meters';


--
-- TOC entry 3473 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN wooden_board.length; Type: COMMENT; Schema: public; Owner: backend
--

COMMENT ON COLUMN public.wooden_board.length IS 'Length in meters';


--
-- TOC entry 3474 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN wooden_board.volume; Type: COMMENT; Schema: public; Owner: backend
--

COMMENT ON COLUMN public.wooden_board.volume IS 'Calculated volume in cubic meters';


--
-- TOC entry 3475 (class 0 OID 0)
-- Dependencies: 226
-- Name: COLUMN wooden_board.confidence; Type: COMMENT; Schema: public; Owner: backend
--

COMMENT ON COLUMN public.wooden_board.confidence IS 'AI detection confidence (0-1)';


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
-- TOC entry 3462 (class 0 OID 24663)
-- Dependencies: 224
-- Data for Name: chat_message; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.chat_message (id, message, is_read_by_buyer, is_read_by_seller, created_at, thread_id, buyer_id, seller_id) FROM stdin;
\.


--
-- TOC entry 3460 (class 0 OID 24620)
-- Dependencies: 222
-- Data for Name: chat_thread; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.chat_thread (id, created_at, buyer_id, seller_id) FROM stdin;
\.


--
-- TOC entry 3463 (class 0 OID 24689)
-- Dependencies: 225
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.image (id, image_path, product_id) FROM stdin;
\.


--
-- TOC entry 3461 (class 0 OID 24638)
-- Dependencies: 223
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.product (id, volume, price, title, descrioption, delivery_possible, pickup_location, created_at, updated_at, seller_id, wood_type_id) FROM stdin;
\.


--
-- TOC entry 3457 (class 0 OID 24590)
-- Dependencies: 219
-- Data for Name: seller; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.seller (id, keycloak_uuid, is_online, created_at, updated_at, last_activity) FROM stdin;
\.


--
-- TOC entry 3458 (class 0 OID 24598)
-- Dependencies: 220
-- Data for Name: wood_type; Type: TABLE DATA; Schema: public; Owner: backend
--

COPY public.wood_type (id, neme, description) FROM stdin;
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


--
-- TOC entry 3246 (class 2606 OID 24581)
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- TOC entry 3248 (class 2606 OID 24586)
-- Name: buyer buyer_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.buyer
    ADD CONSTRAINT buyer_pkey PRIMARY KEY (id);


--
-- TOC entry 3284 (class 2606 OID 24669)
-- Name: chat_message chat_message_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_pkey PRIMARY KEY (id);


--
-- TOC entry 3269 (class 2606 OID 24624)
-- Name: chat_thread chat_thread_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_thread
    ADD CONSTRAINT chat_thread_pkey PRIMARY KEY (id);


--
-- TOC entry 3290 (class 2606 OID 24695)
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- TOC entry 3282 (class 2606 OID 24644)
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- TOC entry 3258 (class 2606 OID 24594)
-- Name: seller seller_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.seller
    ADD CONSTRAINT seller_pkey PRIMARY KEY (id);


--
-- TOC entry 3262 (class 2606 OID 24604)
-- Name: wood_type wood_type_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.wood_type
    ADD CONSTRAINT wood_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3267 (class 2606 OID 24611)
-- Name: wood_type_price wood_type_price_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.wood_type_price
    ADD CONSTRAINT wood_type_price_pkey PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 24708)
-- Name: wooden_board wooden_board_pkey; Type: CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.wooden_board
    ADD CONSTRAINT wooden_board_pkey PRIMARY KEY (id);


--
-- TOC entry 3249 (class 1259 OID 24587)
-- Name: ix_buyer_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_buyer_id ON public.buyer USING btree (id);


--
-- TOC entry 3250 (class 1259 OID 24588)
-- Name: ix_buyer_is_online; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_buyer_is_online ON public.buyer USING btree (is_online);


--
-- TOC entry 3251 (class 1259 OID 24589)
-- Name: ix_buyer_keycloak_uuid; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_buyer_keycloak_uuid ON public.buyer USING btree (keycloak_uuid);


--
-- TOC entry 3252 (class 1259 OID 24716)
-- Name: ix_buyer_last_activity; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_buyer_last_activity ON public.buyer USING btree (last_activity);


--
-- TOC entry 3285 (class 1259 OID 24685)
-- Name: ix_chat_message_buyer_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_chat_message_buyer_id ON public.chat_message USING btree (buyer_id);


--
-- TOC entry 3286 (class 1259 OID 24686)
-- Name: ix_chat_message_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_chat_message_id ON public.chat_message USING btree (id);


--
-- TOC entry 3287 (class 1259 OID 24687)
-- Name: ix_chat_message_seller_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_chat_message_seller_id ON public.chat_message USING btree (seller_id);


--
-- TOC entry 3288 (class 1259 OID 24688)
-- Name: ix_chat_message_thread_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_chat_message_thread_id ON public.chat_message USING btree (thread_id);


--
-- TOC entry 3270 (class 1259 OID 24635)
-- Name: ix_chat_thread_buyer_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_chat_thread_buyer_id ON public.chat_thread USING btree (buyer_id);


--
-- TOC entry 3271 (class 1259 OID 24636)
-- Name: ix_chat_thread_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_chat_thread_id ON public.chat_thread USING btree (id);


--
-- TOC entry 3272 (class 1259 OID 24637)
-- Name: ix_chat_thread_seller_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_chat_thread_seller_id ON public.chat_thread USING btree (seller_id);


--
-- TOC entry 3291 (class 1259 OID 24701)
-- Name: ix_image_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_image_id ON public.image USING btree (id);


--
-- TOC entry 3292 (class 1259 OID 24702)
-- Name: ix_image_image_path; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_image_image_path ON public.image USING btree (image_path);


--
-- TOC entry 3293 (class 1259 OID 24703)
-- Name: ix_image_product_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_image_product_id ON public.image USING btree (product_id);


--
-- TOC entry 3273 (class 1259 OID 24655)
-- Name: ix_product_delivery_possible; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_delivery_possible ON public.product USING btree (delivery_possible);


--
-- TOC entry 3274 (class 1259 OID 24656)
-- Name: ix_product_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_product_id ON public.product USING btree (id);


--
-- TOC entry 3275 (class 1259 OID 24657)
-- Name: ix_product_pickup_location; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_pickup_location ON public.product USING btree (pickup_location);


--
-- TOC entry 3276 (class 1259 OID 24658)
-- Name: ix_product_price; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_price ON public.product USING btree (price);


--
-- TOC entry 3277 (class 1259 OID 24659)
-- Name: ix_product_seller_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_seller_id ON public.product USING btree (seller_id);


--
-- TOC entry 3278 (class 1259 OID 24660)
-- Name: ix_product_title; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_title ON public.product USING btree (title);


--
-- TOC entry 3279 (class 1259 OID 24661)
-- Name: ix_product_volume; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_volume ON public.product USING btree (volume);


--
-- TOC entry 3280 (class 1259 OID 24662)
-- Name: ix_product_wood_type_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_product_wood_type_id ON public.product USING btree (wood_type_id);


--
-- TOC entry 3253 (class 1259 OID 24595)
-- Name: ix_seller_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_seller_id ON public.seller USING btree (id);


--
-- TOC entry 3254 (class 1259 OID 24596)
-- Name: ix_seller_is_online; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_seller_is_online ON public.seller USING btree (is_online);


--
-- TOC entry 3255 (class 1259 OID 24597)
-- Name: ix_seller_keycloak_uuid; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_seller_keycloak_uuid ON public.seller USING btree (keycloak_uuid);


--
-- TOC entry 3256 (class 1259 OID 24717)
-- Name: ix_seller_last_activity; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_seller_last_activity ON public.seller USING btree (last_activity);


--
-- TOC entry 3259 (class 1259 OID 24605)
-- Name: ix_wood_type_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_wood_type_id ON public.wood_type USING btree (id);


--
-- TOC entry 3260 (class 1259 OID 24606)
-- Name: ix_wood_type_neme; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_wood_type_neme ON public.wood_type USING btree (neme);


--
-- TOC entry 3263 (class 1259 OID 24617)
-- Name: ix_wood_type_price_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_wood_type_price_id ON public.wood_type_price USING btree (id);


--
-- TOC entry 3264 (class 1259 OID 24618)
-- Name: ix_wood_type_price_price_per_m3; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_wood_type_price_price_per_m3 ON public.wood_type_price USING btree (price_per_m3);


--
-- TOC entry 3265 (class 1259 OID 24619)
-- Name: ix_wood_type_price_wood_type_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_wood_type_price_wood_type_id ON public.wood_type_price USING btree (wood_type_id);


--
-- TOC entry 3294 (class 1259 OID 24714)
-- Name: ix_wooden_board_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE UNIQUE INDEX ix_wooden_board_id ON public.wooden_board USING btree (id);


--
-- TOC entry 3295 (class 1259 OID 24715)
-- Name: ix_wooden_board_image_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_wooden_board_image_id ON public.wooden_board USING btree (image_id);


--
-- TOC entry 3296 (class 1259 OID 24723)
-- Name: ix_wooden_board_product_id; Type: INDEX; Schema: public; Owner: backend
--

CREATE INDEX ix_wooden_board_product_id ON public.wooden_board USING btree (product_id);


--
-- TOC entry 3304 (class 2606 OID 24670)
-- Name: chat_message chat_message_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyer(id) ON DELETE CASCADE;


--
-- TOC entry 3305 (class 2606 OID 24675)
-- Name: chat_message chat_message_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.seller(id) ON DELETE CASCADE;


--
-- TOC entry 3306 (class 2606 OID 24680)
-- Name: chat_message chat_message_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_message
    ADD CONSTRAINT chat_message_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.chat_thread(id) ON DELETE CASCADE;


--
-- TOC entry 3300 (class 2606 OID 24625)
-- Name: chat_thread chat_thread_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_thread
    ADD CONSTRAINT chat_thread_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyer(id) ON DELETE CASCADE;


--
-- TOC entry 3301 (class 2606 OID 24630)
-- Name: chat_thread chat_thread_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.chat_thread
    ADD CONSTRAINT chat_thread_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.seller(id) ON DELETE CASCADE;


--
-- TOC entry 3307 (class 2606 OID 24696)
-- Name: image image_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- TOC entry 3302 (class 2606 OID 24645)
-- Name: product product_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.seller(id) ON DELETE CASCADE;


--
-- TOC entry 3303 (class 2606 OID 24650)
-- Name: product product_wood_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_wood_type_id_fkey FOREIGN KEY (wood_type_id) REFERENCES public.wood_type(id) ON DELETE CASCADE;


--
-- TOC entry 3299 (class 2606 OID 24718)
-- Name: wood_type_price wood_type_price_wood_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.wood_type_price
    ADD CONSTRAINT wood_type_price_wood_type_id_fkey FOREIGN KEY (wood_type_id) REFERENCES public.wood_type(id) ON DELETE CASCADE;


--
-- TOC entry 3308 (class 2606 OID 24709)
-- Name: wooden_board wooden_board_image_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.wooden_board
    ADD CONSTRAINT wooden_board_image_id_fkey FOREIGN KEY (image_id) REFERENCES public.image(id) ON DELETE CASCADE;


--
-- TOC entry 3309 (class 2606 OID 24724)
-- Name: wooden_board wooden_board_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: backend
--

ALTER TABLE ONLY public.wooden_board
    ADD CONSTRAINT wooden_board_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


-- Completed on 2025-06-09 06:35:11 UTC

--
-- PostgreSQL database dump complete
--

