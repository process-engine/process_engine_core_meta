--
-- PostgreSQL database dump
--

-- Dumped from database version 10.2 (Debian 10.2-1.pgdg90+1)
-- Dumped by pg_dump version 10.3

-- Started on 2018-04-09 09:29:36 CEST

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
-- TOC entry 1 (class 3079 OID 12980)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 3044 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 197 (class 1259 OID 16394)
-- Name: NodeInstance; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."NodeInstance" (
    id uuid NOT NULL,
    name character varying,
    key character varying,
    process uuid,
    "nodeDef" uuid,
    type character varying,
    state character varying,
    participant character varying,
    application character varying,
    "processToken" uuid,
    "instanceCounter" double precision
);


ALTER TABLE public."NodeInstance" OWNER TO admin;

--
-- TOC entry 198 (class 1259 OID 16402)
-- Name: Event; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Event" (
)
INHERITS (public."NodeInstance");


ALTER TABLE public."Event" OWNER TO admin;

--
-- TOC entry 199 (class 1259 OID 16410)
-- Name: BoundaryEvent; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."BoundaryEvent" (
)
INHERITS (public."Event");


ALTER TABLE public."BoundaryEvent" OWNER TO admin;

--
-- TOC entry 200 (class 1259 OID 16418)
-- Name: CatchEvent; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."CatchEvent" (
)
INHERITS (public."Event");


ALTER TABLE public."CatchEvent" OWNER TO admin;

--
-- TOC entry 201 (class 1259 OID 16426)
-- Name: EndEvent; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."EndEvent" (
)
INHERITS (public."Event");


ALTER TABLE public."EndEvent" OWNER TO admin;

--
-- TOC entry 202 (class 1259 OID 16434)
-- Name: ExclusiveGateway; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ExclusiveGateway" (
    follow jsonb
)
INHERITS (public."NodeInstance");


ALTER TABLE public."ExclusiveGateway" OWNER TO admin;

--
-- TOC entry 203 (class 1259 OID 16442)
-- Name: FlowDef; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."FlowDef" (
    id uuid NOT NULL,
    name character varying,
    key character varying,
    "processDef" uuid,
    source uuid,
    target uuid,
    condition character varying,
    extensions jsonb,
    counter double precision
);


ALTER TABLE public."FlowDef" OWNER TO admin;

--
-- TOC entry 204 (class 1259 OID 16450)
-- Name: Lane; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Lane" (
    id uuid NOT NULL,
    name character varying,
    key character varying,
    extensions jsonb,
    "processDef" uuid,
    counter double precision
);


ALTER TABLE public."Lane" OWNER TO admin;

--
-- TOC entry 205 (class 1259 OID 16458)
-- Name: NodeDef; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."NodeDef" (
    id uuid NOT NULL,
    name character varying,
    key character varying,
    "processDef" uuid,
    lane uuid,
    type character varying,
    extensions jsonb,
    "attachedToNode" uuid,
    events jsonb,
    script character varying,
    "eventType" character varying,
    "cancelActivity" boolean,
    "subProcessKey" character varying,
    "subProcessDef" uuid,
    counter double precision,
    "timerDefinitionType" double precision,
    "timerDefinition" character varying,
    "startContext" character varying,
    "startContextEntityType" character varying,
    signal character varying,
    message character varying,
    condition character varying,
    "errorName" character varying,
    "errorCode" character varying
);


ALTER TABLE public."NodeDef" OWNER TO admin;

--
-- TOC entry 206 (class 1259 OID 16466)
-- Name: ParallelGateway; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ParallelGateway" (
    "parallelType" character varying
)
INHERITS (public."NodeInstance");


ALTER TABLE public."ParallelGateway" OWNER TO admin;

--
-- TOC entry 208 (class 1259 OID 16482)
-- Name: Process; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Process" (
    id uuid NOT NULL,
    name character varying,
    key character varying,
    status character varying,
    "processDef" uuid,
    "isSubProcess" boolean,
    "callerId" character varying
);


ALTER TABLE public."Process" OWNER TO admin;

--
-- TOC entry 207 (class 1259 OID 16474)
-- Name: ProcessDef; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ProcessDef" (
    id uuid NOT NULL,
    name character varying,
    key character varying,
    "defId" character varying,
    xml character varying,
    extensions jsonb,
    "internalName" character varying,
    path character varying,
    category character varying,
    module character varying,
    readonly boolean,
    version character varying,
    counter double precision,
    draft boolean,
    latest boolean
);


ALTER TABLE public."ProcessDef" OWNER TO admin;

--
-- TOC entry 209 (class 1259 OID 16490)
-- Name: ProcessToken; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ProcessToken" (
    id uuid NOT NULL,
    data jsonb,
    process uuid
);


ALTER TABLE public."ProcessToken" OWNER TO admin;

--
-- TOC entry 210 (class 1259 OID 16498)
-- Name: ScriptTask; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ScriptTask" (
    script character varying
)
INHERITS (public."NodeInstance");


ALTER TABLE public."ScriptTask" OWNER TO admin;

--
-- TOC entry 211 (class 1259 OID 16506)
-- Name: ServiceTask; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ServiceTask" (
)
INHERITS (public."NodeInstance");


ALTER TABLE public."ServiceTask" OWNER TO admin;

--
-- TOC entry 212 (class 1259 OID 16514)
-- Name: SessionStore; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."SessionStore" (
    id uuid NOT NULL,
    "identityId" character varying,
    "systemUserId" character varying,
    data jsonb,
    roles jsonb
);


ALTER TABLE public."SessionStore" OWNER TO admin;

--
-- TOC entry 213 (class 1259 OID 16522)
-- Name: StartEvent; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."StartEvent" (
)
INHERITS (public."Event");


ALTER TABLE public."StartEvent" OWNER TO admin;

--
-- TOC entry 214 (class 1259 OID 16530)
-- Name: SubprocessExternal; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."SubprocessExternal" (
)
INHERITS (public."NodeInstance");


ALTER TABLE public."SubprocessExternal" OWNER TO admin;

--
-- TOC entry 215 (class 1259 OID 16538)
-- Name: SubprocessInternal; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."SubprocessInternal" (
)
INHERITS (public."NodeInstance");


ALTER TABLE public."SubprocessInternal" OWNER TO admin;

--
-- TOC entry 216 (class 1259 OID 16546)
-- Name: ThrowEvent; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."ThrowEvent" (
)
INHERITS (public."Event");


ALTER TABLE public."ThrowEvent" OWNER TO admin;

--
-- TOC entry 217 (class 1259 OID 16554)
-- Name: Timer; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Timer" (
    id uuid NOT NULL,
    "timerType" double precision,
    "timerIsoString" character varying,
    "timerRule" jsonb,
    "eventName" character varying,
    "lastElapsed" timestamp without time zone
);


ALTER TABLE public."Timer" OWNER TO admin;

--
-- TOC entry 196 (class 1259 OID 16386)
-- Name: User; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."User" (
    id uuid NOT NULL,
    name character varying,
    password character varying,
    roles jsonb
);


ALTER TABLE public."User" OWNER TO admin;

--
-- TOC entry 218 (class 1259 OID 16562)
-- Name: UserTask; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."UserTask" (
)
INHERITS (public."NodeInstance");


ALTER TABLE public."UserTask" OWNER TO admin;

--
-- TOC entry 2841 (class 2606 OID 16417)
-- Name: BoundaryEvent BoundaryEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."BoundaryEvent"
    ADD CONSTRAINT "BoundaryEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 2843 (class 2606 OID 16425)
-- Name: CatchEvent CatchEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."CatchEvent"
    ADD CONSTRAINT "CatchEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 2845 (class 2606 OID 16433)
-- Name: EndEvent EndEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."EndEvent"
    ADD CONSTRAINT "EndEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 2839 (class 2606 OID 16409)
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- TOC entry 2847 (class 2606 OID 16441)
-- Name: ExclusiveGateway ExclusiveGateway_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ExclusiveGateway"
    ADD CONSTRAINT "ExclusiveGateway_pkey" PRIMARY KEY (id);


--
-- TOC entry 2849 (class 2606 OID 16449)
-- Name: FlowDef FlowDef_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."FlowDef"
    ADD CONSTRAINT "FlowDef_pkey" PRIMARY KEY (id);


--
-- TOC entry 2851 (class 2606 OID 16457)
-- Name: Lane Lane_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Lane"
    ADD CONSTRAINT "Lane_pkey" PRIMARY KEY (id);


--
-- TOC entry 2853 (class 2606 OID 16465)
-- Name: NodeDef NodeDef_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeDef"
    ADD CONSTRAINT "NodeDef_pkey" PRIMARY KEY (id);


--
-- TOC entry 2837 (class 2606 OID 16401)
-- Name: NodeInstance NodeInstance_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeInstance"
    ADD CONSTRAINT "NodeInstance_pkey" PRIMARY KEY (id);


--
-- TOC entry 2855 (class 2606 OID 16473)
-- Name: ParallelGateway ParallelGateway_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ParallelGateway"
    ADD CONSTRAINT "ParallelGateway_pkey" PRIMARY KEY (id);


--
-- TOC entry 2857 (class 2606 OID 16481)
-- Name: ProcessDef ProcessDef_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ProcessDef"
    ADD CONSTRAINT "ProcessDef_pkey" PRIMARY KEY (id);


--
-- TOC entry 2861 (class 2606 OID 16497)
-- Name: ProcessToken ProcessToken_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ProcessToken"
    ADD CONSTRAINT "ProcessToken_pkey" PRIMARY KEY (id);


--
-- TOC entry 2859 (class 2606 OID 16489)
-- Name: Process Process_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Process"
    ADD CONSTRAINT "Process_pkey" PRIMARY KEY (id);


--
-- TOC entry 2863 (class 2606 OID 16505)
-- Name: ScriptTask ScriptTask_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ScriptTask"
    ADD CONSTRAINT "ScriptTask_pkey" PRIMARY KEY (id);


--
-- TOC entry 2865 (class 2606 OID 16513)
-- Name: ServiceTask ServiceTask_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ServiceTask"
    ADD CONSTRAINT "ServiceTask_pkey" PRIMARY KEY (id);


--
-- TOC entry 2867 (class 2606 OID 16521)
-- Name: SessionStore SessionStore_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SessionStore"
    ADD CONSTRAINT "SessionStore_pkey" PRIMARY KEY (id);


--
-- TOC entry 2869 (class 2606 OID 16529)
-- Name: StartEvent StartEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."StartEvent"
    ADD CONSTRAINT "StartEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 2871 (class 2606 OID 16537)
-- Name: SubprocessExternal SubprocessExternal_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SubprocessExternal"
    ADD CONSTRAINT "SubprocessExternal_pkey" PRIMARY KEY (id);


--
-- TOC entry 2873 (class 2606 OID 16545)
-- Name: SubprocessInternal SubprocessInternal_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SubprocessInternal"
    ADD CONSTRAINT "SubprocessInternal_pkey" PRIMARY KEY (id);


--
-- TOC entry 2875 (class 2606 OID 16553)
-- Name: ThrowEvent ThrowEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ThrowEvent"
    ADD CONSTRAINT "ThrowEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 2877 (class 2606 OID 16561)
-- Name: Timer Timer_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Timer"
    ADD CONSTRAINT "Timer_pkey" PRIMARY KEY (id);


--
-- TOC entry 2879 (class 2606 OID 16569)
-- Name: UserTask UserTask_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."UserTask"
    ADD CONSTRAINT "UserTask_pkey" PRIMARY KEY (id);


--
-- TOC entry 2835 (class 2606 OID 16393)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 2883 (class 2606 OID 16585)
-- Name: FlowDef FlowDef_processDef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."FlowDef"
    ADD CONSTRAINT "FlowDef_processDef_fkey" FOREIGN KEY ("processDef") REFERENCES public."ProcessDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2884 (class 2606 OID 16590)
-- Name: FlowDef FlowDef_source_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."FlowDef"
    ADD CONSTRAINT "FlowDef_source_fkey" FOREIGN KEY (source) REFERENCES public."NodeDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2885 (class 2606 OID 16595)
-- Name: FlowDef FlowDef_target_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."FlowDef"
    ADD CONSTRAINT "FlowDef_target_fkey" FOREIGN KEY (target) REFERENCES public."NodeDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2886 (class 2606 OID 16600)
-- Name: Lane Lane_processDef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Lane"
    ADD CONSTRAINT "Lane_processDef_fkey" FOREIGN KEY ("processDef") REFERENCES public."ProcessDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2889 (class 2606 OID 16615)
-- Name: NodeDef NodeDef_attachedToNode_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeDef"
    ADD CONSTRAINT "NodeDef_attachedToNode_fkey" FOREIGN KEY ("attachedToNode") REFERENCES public."NodeDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2888 (class 2606 OID 16610)
-- Name: NodeDef NodeDef_lane_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeDef"
    ADD CONSTRAINT "NodeDef_lane_fkey" FOREIGN KEY (lane) REFERENCES public."Lane"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2887 (class 2606 OID 16605)
-- Name: NodeDef NodeDef_processDef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeDef"
    ADD CONSTRAINT "NodeDef_processDef_fkey" FOREIGN KEY ("processDef") REFERENCES public."ProcessDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2890 (class 2606 OID 16620)
-- Name: NodeDef NodeDef_subProcessDef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeDef"
    ADD CONSTRAINT "NodeDef_subProcessDef_fkey" FOREIGN KEY ("subProcessDef") REFERENCES public."NodeDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2881 (class 2606 OID 16575)
-- Name: NodeInstance NodeInstance_nodeDef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeInstance"
    ADD CONSTRAINT "NodeInstance_nodeDef_fkey" FOREIGN KEY ("nodeDef") REFERENCES public."NodeDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2882 (class 2606 OID 16580)
-- Name: NodeInstance NodeInstance_processToken_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeInstance"
    ADD CONSTRAINT "NodeInstance_processToken_fkey" FOREIGN KEY ("processToken") REFERENCES public."ProcessToken"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2880 (class 2606 OID 16570)
-- Name: NodeInstance NodeInstance_process_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NodeInstance"
    ADD CONSTRAINT "NodeInstance_process_fkey" FOREIGN KEY (process) REFERENCES public."Process"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2892 (class 2606 OID 16630)
-- Name: ProcessToken ProcessToken_process_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."ProcessToken"
    ADD CONSTRAINT "ProcessToken_process_fkey" FOREIGN KEY (process) REFERENCES public."Process"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2891 (class 2606 OID 16625)
-- Name: Process Process_processDef_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Process"
    ADD CONSTRAINT "Process_processDef_fkey" FOREIGN KEY ("processDef") REFERENCES public."ProcessDef"(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2018-04-09 09:29:36 CEST

--
-- PostgreSQL database dump complete
--
