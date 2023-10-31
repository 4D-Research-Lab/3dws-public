
import { Row, Col, Button, Modal, Form, Card, ListGroup, ListGroupItem } from 'react-bootstrap'
import React, { useState, useEffect } from 'react';
import firebase from "../../firebase"
import "firebase/compat/firestore"
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { FaTrashAlt } from 'react-icons/fa';
import Link from 'next/link';
import { slugify } from '../../utilities'
import { useAuth } from "../../libs/context";

export default function Collections() {
    const [data, setData] = useState([])
    const [access, setAccess] = useState(false)
    const [models, setModels] = useState([])
    const [unfilteredData, setUnfilteredData] = useState([])
    const [value, setValue] = useState(" ");
    const [show, setShow] = useState(false);
    const [slug, setSlug] = useState("");
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [loading, setLoading] = useState(false);
    const [learningPathway, setLearningPathway] = useState(false);
    const [idsOfLearningPathways, setIdsOfLearningPathways] = useState([]);
    // const [options, setOptions] = useState([]);

    const { displayName } = useAuth();



    const [formData, setFormData] = useState({
        title: "",
        description: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        handleClose()
        postFormData()
    };

    const handleChange = e => {
        setValue(e.target.value)
        let val = e.target.value.trimLeft()

        if (data.length > 1 || e.target.value.length > 1) {
            let filteredData = data.filter(item => (item.title.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.creator.toLowerCase().indexOf(val.toLowerCase()) > -1 || item.description.toLowerCase().indexOf(val.toLowerCase()) > -1))
            setData(filteredData)
        }
        else {
            setData(unfilteredData)
        }
    };

    const updateFormData = event => {
        if (event.target.name != "public") {
            setFormData({
                ...formData,
                [event.target.name]: event.target.value
            });
        }
        else {
            setFormData({
                ...formData,
                [event.target.name]: event.target.value
            });
        }
    }


    const handleSwitch = (e) => {
        setAccess(!access)
    }

    const handleLearningPathway = (e) => {
        setLearningPathway(!learningPathway)
    }


    const { title, description, url } = formData;

    //Get collections
    useEffect(() => {
        if (loading == false) {
            const db = firebase.firestore();
            db.collection("collections")
                .get()
                .then((snapshot) => {
                    const list = []
                    snapshot.forEach((doc, i) => {
                        const obj = doc.data()
                        Object.assign(obj, { id: doc.id });
                        list.push(obj)
                    });
                    setData(list)
                    setUnfilteredData(list)
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
        }
    }, [loading])

    //Get ids of collections with learningpathway
    useEffect(() => {
        const db = firebase.firestore();

        db.collection("learning-pathways")
            .get()
            .then((snapshot) => {
                const list = []
                snapshot.forEach((doc, i) => {
                    const obj = doc.data()

                    list.push(obj.collectionId)
                });
                setIdsOfLearningPathways(list)


            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });


    }, [loading])

    async function postFormData() {
        setLoading(true)
        const db = firebase.firestore();

        setSlug(slugify(formData.title))
        await addDoc(collection(db, "collections"), {
            creator: displayName,
            title: formData.title,
            description: formData.description,
            timeStamp: Date.now(),
            lastEdit: Date.now(),
            slug: slugify(formData.title),
            access: access,
            models: []
        });
        setLoading(false)
    }

    async function deleteDocByID(id) {
        setLoading(true)
        const db = firebase.firestore()
        await deleteDoc(doc(db, "collections", id));


        const annotationsDoc = await db.collection("annotations")
            .where("collectionId", "==", id)
            .get();
        annotationsDoc.forEach(element => {
            element.ref.delete();
        });

        const commentsDoc = await db.collection("comments")
            .where("collectionId", "==", id)
            .get();
        commentsDoc.forEach(element => {
            element.ref.delete();
        });

        const learningPathwaysDoc = await db.collection("learning-pathways")
            .where("collectionId", "==", id)
            .get();
        learningPathwaysDoc.forEach(element => {
            element.ref.delete();
        });

        setLoading(false)
    }

    return (
        <Row>
            <Col md={{ span: 9, offset: 2 }}>
                <div>
                    <h1>Collections </h1>

                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Collection</Modal.Title>
                        </Modal.Header>
                        <Modal.Body><Form onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <Form.Group as={Col} md="12" controlId="validationCustom01">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="Title"
                                        name="title"
                                        onChange={e => updateFormData(e)}
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} md="12" controlId="validationCustom02">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        required
                                        type="text"
                                        placeholder="description"
                                        name="description"
                                        onChange={e => updateFormData(e)}
                                    />
                                </Form.Group>
                            </Row>

                            <Row className="mb-3">
                                <Form.Group as={Col} md="12" controlId="validationCustom03">
                                    <Form.Label>Access</Form.Label>

                                    <Form.Check
                                        onChange={e => handleSwitch(e)}

                                        name="access"
                                        type="switch"
                                        id="custom-switch"
                                        label="Public"
                                    />

                                </Form.Group>
                            </Row>
                            <Button type="submit">Submit</Button>
                        </Form></Modal.Body>
                        <Modal.Footer>

                        </Modal.Footer>
                    </Modal>
                    <Row>
                        <Col sm={3}><div>
                            {displayName ?
                                <Button className="spacing" variant="primary" onClick={handleShow}>
                                    Add Collection
                                </Button>

                                : <div></div>
                            }
                        </div>
                            <div className='spacing'></div>
                            <div>
                                <form>
                                    <label>
                                        Search collections
                                        <div className='spacing small'>
                                            <i>Search through titles and description</i>
                                        </div>
                                        <input type="text" name="name" onChange={handleChange} value={value} />
                                    </label>
                                </form>
                                <div className='spacing'></div>
                                <div className='spacing'></div>
                                <Form>
                                    <Form.Check
                                        type="switch"
                                        id="custom-switch"
                                        label="Learning Pathways"
                                        onChange={e => handleLearningPathway(e)}

                                    />
                                </Form>
                            </div>
                        </Col>
                        <Col sm={9}>
                            {learningPathway ? <Row>
                                {data.map(item => {

                                    if ((item.access == true || (item.access == false & displayName.length > 1)) && (idsOfLearningPathways.indexOf(item.id) != -1)) {
                                        return <Col className='spacing' sm={4} key={item.timeStamp}>
                                            <Card className='collection-press'>
                                                <Link href={`collections/${item.slug}`} passHref>
                                                    <Card.Img variant="top" src="placeholder.jpg" />
                                                </Link  >
                                                <Link href={`collections/${item.slug}`} passHref>

                                                    <Card.Body>
                                                        <Card.Title>
                                                            {item.title}
                                                        </Card.Title>
                                                        <Card.Text>
                                                            {item.description}
                                                        </Card.Text>
                                                    </Card.Body>
                                                </Link>

                                                <ListGroup className="list-group-flush">
                                                    <ListGroupItem>{item.creator}
                                                        {displayName && <Button onClick={() => deleteDocByID(item.id)} variant='secondary' className="pull-right" size="sm"><FaTrashAlt /></Button>}
                                                    </ListGroupItem>
                                                </ListGroup>
                                            </Card>
                                        </Col>
                                    }

                                })}
                            </Row> : <Row>
                                {data.map(item => {

                                    if (item.access == true || (item.access == false & displayName.length > 1)) {
                                        return <Col className='spacing' sm={4} key={item.timeStamp}>
                                            <Card className='collection-press'>
                                                <Link href={`collections/${item.slug}`} passHref>
                                                    <Card.Img variant="top" src="placeholder.jpg" />
                                                </Link  >
                                                <Link href={`collections/${item.slug}`} passHref>

                                                    <Card.Body>
                                                        <Card.Title>
                                                            {item.title}
                                                        </Card.Title>
                                                        <Card.Text>
                                                            {item.description}
                                                        </Card.Text>
                                                    </Card.Body>
                                                </Link>
                                                <ListGroup className="list-group-flush">
                                                    <ListGroupItem>{item.creator}
                                                        {displayName && <Button onClick={() => deleteDocByID(item.id)} variant='secondary' className="pull-right" size="sm"><FaTrashAlt /></Button>}
                                                    </ListGroupItem>
                                                </ListGroup>
                                            </Card>
                                        </Col>
                                    }
                                })}
                            </Row>}
                        </Col>
                    </Row>
                </div>
            </Col>
        </Row>
    )
}