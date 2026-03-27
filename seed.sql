--
-- PostgreSQL database dump
--

\restrict gBa80MsiInW8fIdCQheQwDTzzFy9rQrOqaHQF2wliYawTIdaYTeEGLTlYn21X8z

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: cvs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cvs (
    id integer NOT NULL,
    user_id integer,
    content jsonb NOT NULL,
    profile_image_url text,
    show_profile_image boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cvs OWNER TO postgres;

--
-- Name: cvs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cvs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cvs_id_seq OWNER TO postgres;

--
-- Name: cvs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cvs_id_seq OWNED BY public.cvs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cvs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs ALTER COLUMN id SET DEFAULT nextval('public.cvs_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cvs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cvs (id, user_id, content, profile_image_url, show_profile_image, created_at) FROM stdin;
7	1	{"title": "Student and AI Enthusiast", "extras": {"awards": ["Best Project Award at the AI Institute Summer Program"], "languages": ["English", "Spanish"], "certifications": ["AI Certification by Coursera"]}, "skills": {"soft": ["Communication", "Teamwork", "Problem-Solving", "Time Management"], "tools": ["Jupyter Notebook", "PyCharm", "Visual Studio Code"], "technical": ["Python", "JavaScript", "HTML/CSS", "SQL", "Machine Learning"]}, "contact": {"email": "omae@gmail.com", "phone": "123-456-7890", "linkedin": "https://www.linkedin.com/in/omae/", "portfolio": "https://github.com/omae"}, "summary": "Dedicated student and AI enthusiast with a strong passion for learning and growth. Proficient in Python and JavaScript, with a focus on developing innovative solutions to real-world problems.", "fullName": "Olivia Mae", "projects": [{"name": "Chatbot", "bullets": ["Designed and implemented a conversational flow using natural language processing", "Trained the chatbot on a dataset of user queries", "Deployed the chatbot on a cloud platform"], "description": "Developed a simple chatbot using Python and the NLTK library to answer user queries"}, {"name": "Image Classification", "bullets": ["Collected and preprocessed a dataset of images", "Designed and trained a convolutional neural network to classify images", "Evaluated the model's performance using metrics such as accuracy and precision"], "description": "Built a machine learning model to classify images using Python and the TensorFlow library"}], "education": [{"year": "2020-2024", "degree": "Bachelor of Science in AI", "school": "University of AI"}], "experience": [{"role": "Research Assistant", "bullets": ["Assisted in developing a machine learning model to predict stock prices", "Conducted research on natural language processing techniques", "Presented research findings to the research team"], "company": "AI Institute Summer Program", "duration": "June 2022 - August 2022"}]}	\N	t	2026-03-27 22:10:42.486161
8	1	{"title": "Full Stack Developer", "extras": {"awards": ["Best Developer in the Company"], "languages": ["English", "Yoruba"], "certifications": ["Certified Full Stack Developer (CFSD)"]}, "skills": {"soft": ["Communication", "Teamwork", "Problem-solving"], "tools": ["Visual Studio Code", "Git", "Jenkins", "Docker"], "technical": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "MySQL"]}, "contact": {"email": "omojolaobaloluwa@gmail.com", "phone": "+234 08069989705", "linkedin": "linkedin.com/in/omojolaobaloluwa", "portfolio": "www.mealsection.com"}, "summary": "Highly motivated and detail-oriented Full Stack Developer with 6 years of experience in designing, developing, and deploying scalable web applications. Skilled in various programming languages and technologies, with a strong passion for learning and staying up-to-date with industry trends.", "fullName": "Omojola Obaloluwa", "projects": [{"name": "Web Application Project", "bullets": ["Designed and developed the application using React, Node.js, and MongoDB.", "Implemented authentication and authorization using Passport.js.", "Deployed the application to a cloud platform using Docker and Kubernetes."], "description": "A web application that allows users to create, read, update, and delete (CRUD) data using a RESTful API."}, {"name": "E-commerce Website", "bullets": ["Designed and developed the website using HTML, CSS, and JavaScript.", "Implemented payment gateway using Stripe.", "Improved website performance by optimizing images and minimizing code."], "description": "An e-commerce website that allows users to browse and purchase products online."}], "education": [{"year": "2015-2019", "degree": "Bachelor of Science in Computer Science", "school": "Obafemi Awolowo University"}], "experience": [{"role": "Full Stack Developer", "bullets": ["Designed and developed multiple web applications using React, Node.js, and MongoDB.", "Worked closely with cross-functional teams to identify project requirements and developed solutions that met those needs.", "Improved code quality and efficiency by implementing best practices and contributing to the development of company standards."], "company": "Current Role", "duration": "January 2020 - Present"}]}	{}	t	2026-03-27 22:12:11.417024
9	1	{"title": "Full Stack Developer", "extras": {"awards": ["Best Full Stack Developer of the Year (2019)"], "languages": ["English (Native)", "Yoruba (Native)", "French (Intermediate)"], "certifications": ["Certified Full Stack Developer (CFSWD)"]}, "skills": {"soft": ["Teamwork", "Communication", "Problem-solving", "Time management"], "tools": ["Git", "GitHub", "Visual Studio Code", "IntelliJ IDEA", "Postman"], "technical": ["JavaScript", "React", "Angular", "Vue.js", "Node.js", "Express.js", "MongoDB", "MySQL", "PostgreSQL"]}, "contact": {"email": "omojolaobaloluwa@gmail.com", "phone": "08069989705", "linkedin": "https://linkedin.com/in/omojola", "portfolio": "https://www.mealsection.com"}, "summary": "Highly motivated and experienced full stack developer with 6 years of experience in building scalable and efficient software solutions. Skilled in a range of programming languages, frameworks, and technologies.", "fullName": "Omojola Obaloluwa", "projects": [{"name": "Meal Section", "bullets": ["Built a scalable and efficient web application using React, Node.js, and MongoDB.", "Integrated payment gateway and implemented user authentication.", "Improved user experience and increased customer satisfaction."], "description": "A web application for meal ordering and delivery."}], "education": [{"year": "2015 - 2018", "degree": "B.Sc. in Computer Science", "school": "University of Lagos"}], "experience": [{"role": "Full Stack Developer", "bullets": ["Designed and developed multiple web applications using React, Node.js, and MongoDB.", "Improved code quality and maintained high performance of existing applications.", "Collaborated with cross-functional teams to deliver projects on time and within budget."], "company": "Current Employer", "duration": "January 2020 - Present"}, {"role": "Junior Developer", "bullets": ["Developed and deployed multiple features for existing applications using JavaScript and HTML/CSS.", "Participated in code reviews and contributed to improving overall code quality.", "Assisted in troubleshooting and resolving issues with existing applications."], "company": "Previous Employer", "duration": "January 2018 - December 2019"}]}	{}	t	2026-03-27 22:12:11.926576
10	1	{"title": "Test Engineer", "extras": {"awards": ["Best Test Engineer in 2022"], "languages": ["English (Native)", "Yoruba (Fluent)"], "certifications": ["Certified Scrum Master (CSM)"]}, "skills": {"soft": ["Strong communication and interpersonal skills", "Collaborative team player", "Attention to detail and analytical skills"], "tools": ["JIRA", "TestRail", "Postman", "Git"], "technical": ["Automated Testing", "Manual Testing", "Agile methodologies", "SQL", "Python"]}, "contact": {"email": "omojolaobaloluwa@gmail.com", "phone": "+2348069989705", "linkedin": "https://www.linkedin.com/in/olubukola-omojola/", "portfolio": "https://omojolaobaloluwa.github.io"}, "summary": "Dedicated Test Engineer with a passion for delivering high-quality software solutions. Proven track record of identifying and resolving complex technical issues, with excellent communication and problem-solving skills.", "fullName": "Olubukola Omojola", "projects": [{"name": "Automated Testing Framework", "bullets": [" Designed and implemented a modular testing framework", "Integrated with CI/CD pipeline for seamless testing and deployment"], "description": "Developed an automated testing framework using Python and SQL, reducing manual testing time by 50%"}], "education": [{"year": "2020", "degree": "Bachelor of Science in Computer Science", "school": "University of Technology"}], "experience": [{"role": "Test Engineer", "bullets": ["Developed and executed test plans for multiple software projects, resulting in a 30% reduction in defects", "Led cross-functional teams to identify and resolve complex technical issues, improving team productivity by 25%", "Built and maintained automated testing frameworks using Python and SQL, reducing manual testing time by 50%"], "company": "Eee Company", "duration": "January 2022 - Present"}]}	\N	t	2026-03-27 22:13:17.603137
11	1	{"title": "Junior Software Developer", "extras": {"awards": [], "languages": ["English (Native)", "Yoruba (Fluent)"], "certifications": ["Certified Java Developer (OCPJP)"]}, "skills": {"soft": ["Communication", "Teamwork", "Time Management", "Problem-Solving", "Adaptability"], "tools": ["Eclipse", "IntelliJ IDEA", "Visual Studio Code", "Postman", "Jenkins"], "technical": ["Java", "Python", "JavaScript", "C++", "SQL", "Git", "Linux"]}, "contact": {"email": "omojolaobaloluwa@gmail.com", "phone": "+2348069989705", "linkedin": "linkedin.com/in/omojolaobaloluwa", "portfolio": "omojolaobaloluwa.github.io"}, "summary": "Dedicated and detail-oriented junior software developer with a passion for building scalable and efficient software solutions. Proficient in a range of programming languages and technologies, with a strong foundation in data structures and algorithms.", "fullName": "Omololuwa Omojola", "projects": [{"name": "Personal Portfolio", "bullets": ["Designed and implemented a user-friendly interface using React and Redux", "Developed a custom theme using a dark mode feature", "Integrated a contact form using Node.js and Express.js"], "description": "A responsive web application built using JavaScript, HTML, and CSS to showcase my skills and experience"}, {"name": "To-Do List App", "bullets": ["Designed and implemented a user-friendly interface using Java Swing", "Developed a database to store user tasks and reminders", "Implemented a feature to save and load tasks and reminders from a file"], "description": "A simple desktop application built using Java and Swing to manage tasks and reminders"}], "education": [{"year": "2015 - 2019", "degree": "Bachelor of Science in Computer Science", "school": "University of Lagos"}], "experience": [{"role": "Junior Software Developer", "bullets": ["Developed and deployed multiple web applications using Java and Python", "Collaborated with cross-functional teams to identify and prioritize project requirements", "Designed and implemented efficient data structures and algorithms to optimize system performance", "Conducted unit testing and integration testing to ensure high-quality software delivery", "Contributed to the development of a team-managed project using Agile methodologies"], "company": "EEe Solutions", "duration": "2020 - Present"}]}	\N	t	2026-03-27 22:13:17.712244
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, created_at) FROM stdin;
1	test@gmail.com	123456	2026-03-27 22:10:15.712401
\.


--
-- Name: cvs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cvs_id_seq', 11, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: cvs cvs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT cvs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cvs cvs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cvs
    ADD CONSTRAINT cvs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict gBa80MsiInW8fIdCQheQwDTzzFy9rQrOqaHQF2wliYawTIdaYTeEGLTlYn21X8z

