--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5 (Debian 10.5-1.pgdg90+1)
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: Correlations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Correlations" (
    id uuid NOT NULL,
    "correlationId" character varying(255) NOT NULL,
    "processModelHash" text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Correlations" OWNER TO admin;

--
-- Name: FlowNodeInstances; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."FlowNodeInstances" (
    id uuid NOT NULL,
    "flowNodeInstanceId" character varying(255) NOT NULL,
    "flowNodeId" character varying(255) NOT NULL,
    state character varying(255) DEFAULT 0 NOT NULL,
    error character varying(255),
    "isSuspended" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."FlowNodeInstances" OWNER TO admin;

--
-- Name: ProcessDefinitions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ProcessDefinitions" (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    xml text NOT NULL,
    hash text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ProcessDefinitions" OWNER TO admin;

--
-- Name: ProcessTokens; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ProcessTokens" (
    id uuid NOT NULL,
    "processInstanceId" character varying(255) NOT NULL,
    "processModelId" character varying(255) NOT NULL,
    "correlationId" character varying(255) NOT NULL,
    identity text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT '2018-09-05 08:47:19.863+00'::timestamp with time zone,
    caller character varying(255),
    type character varying(255),
    payload text,
    "flowNodeInstanceId" character varying(255) NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."ProcessTokens" OWNER TO admin;

--
-- Name: Timers; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Timers" (
    id uuid NOT NULL,
    type integer NOT NULL,
    "expirationDate" timestamp with time zone,
    rule character varying(255),
    "eventName" character varying(255) NOT NULL,
    "lastElapsed" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Timers" OWNER TO admin;


--
-- Name: Correlations Correlations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Correlations"
    ADD CONSTRAINT "Correlations_pkey" PRIMARY KEY (id);


--
-- Name: FlowNodeInstances FlowNodeInstances_flowNodeInstanceId_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."FlowNodeInstances"
    ADD CONSTRAINT "FlowNodeInstances_flowNodeInstanceId_key" UNIQUE ("flowNodeInstanceId");


--
-- Name: FlowNodeInstances FlowNodeInstances_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."FlowNodeInstances"
    ADD CONSTRAINT "FlowNodeInstances_pkey" PRIMARY KEY (id);


--
-- Name: ProcessDefinitions ProcessDefinitions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ProcessDefinitions"
    ADD CONSTRAINT "ProcessDefinitions_pkey" PRIMARY KEY (id);


--
-- Name: ProcessTokens ProcessTokens_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ProcessTokens"
    ADD CONSTRAINT "ProcessTokens_pkey" PRIMARY KEY (id);


--
-- Name: Timers Timers_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Timers"
    ADD CONSTRAINT "Timers_pkey" PRIMARY KEY (id);


--
-- Name: ProcessTokens ProcessTokens_flowNodeInstanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ProcessTokens"
    ADD CONSTRAINT "ProcessTokens_flowNodeInstanceId_fkey" FOREIGN KEY ("flowNodeInstanceId") REFERENCES public."FlowNodeInstances"("flowNodeInstanceId") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

