import { Form, Row, Col, Tabs, Tab, Card, Button, DropdownButton, Dropdown, InputGroup } from "react-bootstrap";
import React, { useState, useEffect } from 'react';
import firebase from "../../firebase"
import "firebase/compat/firestore"
import { FaTrashAlt } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { doc, updateDoc, arrayUnion, collection, setDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { useAuth } from "../../libs/context";
import { MdEditNote } from 'react-icons/md';
import Pagination from 'react-bootstrap/Pagination';

import Modal from 'react-bootstrap/Modal'

export async function getServerSideProps() {
    const response = await fetch('https://voyager-data.create.humanities.uva.nl/').then(function (res) {
        return res.text()
    })

    return {
        props: {
            html: response
        }
    }
}

export default function Collection({ html }) {
    const models = []
    var models_in_collection = []
    const page_size=6
	

	function getStartAllModels(){
		var q=[]
		var doc = document.createElement("html");
		doc.innerHTML = html;
		var links = doc.getElementsByTagName("a")
		var urls = [];

		for (var i = 0; i < links.length; i++) {
			urls.push(links[i].getAttribute("href"));
		}
		//this makes sure that the pagination for the add models tab works
		q = urls.filter(name => name.includes('.svx.json'))
		return q;
	}
    const [toggledoff, setToggledoff] = useState([])
    const [allmodels, setAllmodels] = useState(getStartAllModels())
    const [modelsForPaginationLoaded, setModelsForPaginationLoaded] = useState(false)
    const [modelArray, setModelArray] = useState([])
    const [modelData, setModelData] = useState([])
    const [lmodelData, setLModelData] = useState([])
    const [allModelData, setAllModelData] = useState([])
    const [categoryData, setCategoryData] = useState({})
    const [allData, setAllData] = useState([])
    const [data, setData] = useState([])
    const [show, setShow] = useState(false)
    const [showAnnotation, setShowAnnotation] = useState(false)
    const [showEditAnnotation, setShowEditAnnotation] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const [showEditComment, setShowEditComment] = useState(false)
    const [showLearningPathway, setShowLearningPathway] = useState(false)
    const [showEditLearningPathway, setShowEditLearningPathway] = useState(false)
    const [currentTitle, setCurrentTitle] = useState('')
    const [currentAnnotation, setCurrentAnnotation] = useState('')
    const [currentComment, setCurrentComment] = useState('')
    const [currentHeading, setCurrentHeading] = useState('')
    const [currentContent, setCurrentContent] = useState('')
    const [currentAnnotationId, setCurrentAnnotationId] = useState('')
    const [annotationData, setAnnotationData] = useState([])
    const [commentData, setCommentData] = useState([])
    const [learningPathwayData, setLearningPathwayData] = useState([])
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState(" ");
    const path = window.location.pathname.split("/").pop()
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleShowEditAnnotation = () => setShowEditAnnotation(true);
    const handleCloseEditAnnotation = () => setShowEditAnnotation(false);


    //To get the right model from the learning pathway model list
    var localmodel;	
    const getLocalModel = (hyperlink) => {
	var lemod=null;
	for (var i =0; i < lmodelData.length; i++){
		if(lmodelData[i].path == allmodels[hyperlink.model]) {
			lemod = i;
		}
	}
	return lemod;

    }
    const handleShowComment = (id) => {
        setCurrentAnnotationId(id)
        setShowComment(true);
    }
    const handleCloseComment = () => setShowComment(false);
    const handleShowEditComment = () => {
        setShowEditComment(true);
    }
    const handleShowEditLearningPathway = () => {
        setShowEditLearningPathway(true);
    }
    const handleCloseEditComment = () => setShowEditComment(false);
    const handleCloseEditLearningPathway = () => setShowEditLearningPathway(false);
    const handleShowLearningPathway = () => {
	setShowLearningPathway(true);
    }
    const handleCloseLearningPathway = () => setShowLearningPathway(false);
    const handleCloseAnnotation = () => setShowAnnotation(false);
    const { displayName } = useAuth();
    const [access, setAccess] = useState(null);
    const [items, setItems] = useState(1);
    const [active, setActive] = useState(1);
    const [steps, setSteps] = useState([]);
    const [currentModelNumber, setCurrentModelNumber] = useState(0);
    const [currentStepNumber, setCurrentStepNumber] = useState(0);
    const [hyperlinks, setHyperlinks] = useState([])
    const [hyperlinkModelToUse, setHyperlinkModelToUse] = useState([])

    const getStepName = (localmodel, steppy) => {
	var voyagerElement = document.getElementById(localmodel);
	if(voyagerElement !== null){
		var tours = voyagerElement.application.system.components._objLists.CVTours[0]._tours;
		if(tours.length > 0){
			//if(typeof tours[0].steps[steppy,tours] != 'undefined') {
				return tours[0].steps[steppy].titles['EN'];
			//}
		}
	}
    }

    const handleHyperlinkChange = async (e) => {
        setLoading(true)
        setCurrentModelNumber(Number(e.target.value))
        if (e.target.value != "Select model") {
			//needs to load the model, to find annotations. Here only allmodels (w/model names only) should be available
			var voyagerElement = document.getElementById(allmodels[e.target.value]);
			if(voyagerElement !== null){


				var tours = voyagerElement.application.system.components._objLists.CVTours[0]._tours;
				var steppies=[];
				if(tours.length > 0){
					for (var i =0; i < tours[0].steps.length; i++){
						steppies.push(tours[0].steps[i]);
					}
				}
				if(tours.length > 0){
					for (var i =0; i < tours[0].steps.length; i++){
						steppies[i].title = steppies[i].titles['EN'];
					}
				} else {
					setHyperlinks([])
				}
				var modeltouse = {
					'path': e.target.value,
					'annotations': steppies
				}
				setHyperlinkModelToUse(modeltouse);
          		setSteps(steppies)
		} else {
			setHyperlinks([])
			var modeltouse = {
				'path': e.target.value,
				'annotations': Array()
			}
			setSteps(Array())
		}
}
        setLoading(false)

    }
    const handleHyperlinkChangeStep = (e) => {
        setCurrentStepNumber(Number(e.target.value))
    }

    const handleAddHyperlink = () => {
        let arr = [currentModelNumber, currentStepNumber]
        setHyperlinks(hyperlinks => [...hyperlinks, { model: currentModelNumber, step: currentStepNumber }]);
    };

    const handleRemoveHyperlink = () => {
        setHyperlinks(hyperlinks.slice(0, -1));
    };

    function paginate(array, page_number) {
        // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

    useEffect(() => {
	}, [loading])


    const [editData, setEditData] = useState({
        title: "",
        description: "",
    });

    const [editAnnotationData, setEditAnnotationData] = useState({
        title: "",
        annotation: "",
        id: ""
    });

    const [editCommentData, setEditCommentData] = useState({
        comment: "",
        id: ""
    });

    const [editLearningPathwayData, setEditLearningPathwayData] = useState({
        heading: "",
        content: "",
        id: ""
    });


    const handleEdit = e => {
        setEditData({
            title: categoryData.title,
            description: categoryData.description,
        });
        setAccess(categoryData.access)
        handleShow()
    };

    const handleAnnotationEdit = (id, title, annotation) => {
        setEditAnnotationData({
            id: id,
            title: title,
            annotation: annotation,
        });

        handleShowEditAnnotation()
    };


    const handleCommentEdit = (id, annotationId, comment) => {
        setEditCommentData({
            id: id,
            annotationId: annotationId,
            comment: comment
        });

        handleShowEditComment()
    };

    const handleLearningPathwayEdit = (id, heading, content) => {
        setEditLearningPathwayData({
            id: id,
            heading: heading,
            content: content
        });

        handleShowEditLearningPathway()
    };

    const handleSwitch = (e) => {
        setAccess(!access)
    }


    async function postEditData() {
        const db = firebase.firestore();
        const collections = doc(db, "collections", categoryData.id)
        await updateDoc(collections, {
            title: editData.title,
            description: editData.description,
            lastEdit: Date.now(),
            access: access,
        });
        handleClose()
        setLoading(false)
    }
    async function postEditAnnotationData() {
        const db = firebase.firestore();
        const collections = doc(db, "collections", categoryData.id)
        await updateDoc(collections, {

            lastEdit: Date.now(),
        });
        const annotations = doc(db, "annotations", editAnnotationData.id)
        await updateDoc(annotations, {
            title: editAnnotationData.title,
            annotation: editAnnotationData.annotation,
        });

        handleCloseEditAnnotation()
        setLoading(false)
    }

    async function postEditCommentData() {
        const db = firebase.firestore();
        const collections = doc(db, "collections", categoryData.id)
        await updateDoc(collections, {
            lastEdit: Date.now(),
        });
        const comments = doc(db, "comments", editCommentData.id)
        await updateDoc(comments, {
            comment: editCommentData.comment,
        });

        handleCloseEditComment()
        setLoading(false)
    }

    async function postEditLearningPathwayData() {
        const db = firebase.firestore();
        const collections = doc(db, "collections", categoryData.id)

        await updateDoc(collections, {
            lastEdit: Date.now(),
        });

        const learningPathways = doc(db, "learning-pathways", editLearningPathwayData.id)
        await updateDoc(learningPathways, {
            content: editLearningPathwayData.content,
            heading: editLearningPathwayData.heading
        });
        handleCloseEditLearningPathway()
        setLoading(false)
    }

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postEditData()
        setLoading(true)
    };

    const handleEditAnnotationSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postEditAnnotationData()
        setLoading(true)
    };

    const handleEditCommentSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postEditCommentData()
        setLoading(true)
    };

    const handleEditLearningPathwaySubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postEditLearningPathwayData()
        setLoading(true)
    };

    const updateEditData = event => {
        if (event.target.type === "checkbox") {
            setAccess(event.target.checked)
        }
        setEditData({
            ...editData,
            [event.target.name]: event.target.value
        });
    }
    const updateEditAnnotationData = event => {
        setEditAnnotationData({
            ...editAnnotationData,
            [event.target.name]: event.target.value
        });
    }
    const updateEditCommentData = event => {
        setEditCommentData({
            ...editCommentData,
            [event.target.name]: event.target.value
        });
    }

    const updateEditLearningPathwayData = event => {

        setEditLearningPathwayData({
            ...editLearningPathwayData,
            [event.target.name]: event.target.value
        });
    }

    const handleChange = e => {
        setLoading(true)
        setValue(e.target.value)
        let val = e.target.value.trimLeft()

        if (allModelData.length > 1 || e.target.value.length > 1) {
            // if search value is not in path - (.svx.json) filter data
            let filteredData = allModelData.filter(item => (item.path.replace(".svx.json", "").indexOf(val) > -1))
        }
        setLoading(false)

    };

    async function postAnnotationData() {
        const db = firebase.firestore();
        const annotations = doc(collection(db, "annotations"));
        let timeStamp = Date.now()

        let data = {
            title: currentTitle,
            annotation: currentAnnotation,
            date: new Date().toLocaleString("nl-NL").split(',')[0],
            name: displayName,
            timeStamp: timeStamp,
            collectionId: categoryData.id,
            comments: []
        }
        await setDoc(annotations, data);


        setLoading(false)
    }

    async function postCommentData() {
        const db = firebase.firestore();
        const comments = doc(collection(db, "comments"));
        let timeStamp = Date.now()

        let data = {
            comment: currentComment,
            date: new Date().toLocaleString("nl-NL").split(',')[0],
            name: displayName,
            timeStamp: timeStamp,
            annotationId: currentAnnotationId,
            collectionId: categoryData.id,
        }
        await setDoc(comments, data);
        setLoading(false)
    }

    async function postLearningPathwayData() {
        const db = firebase.firestore();
        const learningPathways = doc(collection(db, "learning-pathways"));
        let timeStamp = Date.now()

        let data = {
            heading: currentHeading,
            content: currentContent,
            date: new Date().toLocaleString("nl-NL").split(',')[0],
            name: displayName,
            timeStamp: timeStamp,
            collectionId: categoryData.id,
            hyperlinks: hyperlinks.flat()
        }
        await setDoc(learningPathways, data);
        setLoading(false)
    }


    const handleAnnotationSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postAnnotationData()
        handleCloseAnnotation()
        setLoading(true)
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postCommentData()
        handleCloseComment()
        setLoading(true)
    };

    const handleLearningPathwaySubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        postLearningPathwayData()
        handleCloseLearningPathway()
        setLoading(true)
    };



    const updateAnnotationData = e => {
        if (e.target.name == "title") {
            setCurrentTitle(e.target.value)
        }
        if (e.target.name == "annotation") {
            setCurrentAnnotation(e.target.value)
        }
    }

    const updateCommentData = e => {
        setCurrentComment(e.target.value)
    }


    const updateLearningPathwayData = e => {
        if (e.target.name == "heading") {
            setCurrentHeading(e.target.value)
        }
        if (e.target.name == "content") {
            setCurrentContent(e.target.value)
        }
    }


    //Get collection info
    useEffect(() => {
        const db = firebase.firestore();
        db.collection("collections")
            .where('slug', '==', path)
            .get()
            .then((snapshot) => {
                const list = []
                snapshot.forEach((doc, i) => {
                    const obj = doc.data()
                    Object.assign(obj, { id: doc.id });
                    list.push(obj)

                });
                setCategoryData(list[0])
		models_in_collection = list[0].models
		fetchCollectionData()
            })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });

    }, [loading])


    async function addToCollection(slug) {
        const db = firebase.firestore();
        const collections = doc(db, "collections", "yEWiHuxPgGUELf1Zznxz");
        await updateDoc(collections, {
            models: arrayUnion(slug)
        });

    }

    //Get annotations info
    useEffect(() => {
        if (typeof categoryData.id !== 'undefined') {

            const db = firebase.firestore();
            db.collection("annotations")
                .where("collectionId", "==", categoryData.id)
                .get()
                .then((snapshot) => {
                    const list = []
                    snapshot.forEach((doc, i) => {
                        const obj = doc.data()
                        Object.assign(obj, { id: doc.id });
                        list.push(obj)
                    })
                    setAnnotationData(list.sort(function (a, b) {
                        return a.timeStamp - b.timeStamp;
                    }))

                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
        }

    }, [categoryData])

    //Get comments info
    useEffect(() => {
        if (typeof categoryData.id !== 'undefined') {
            const db = firebase.firestore();
            db.collection("comments")
                .where("collectionId", "==", categoryData.id)
                .get()
                .then((snapshot) => {
                    const list = []
                    snapshot.forEach((doc, i) => {
                        const obj = doc.data()
                        Object.assign(obj, { id: doc.id });
                        list.push(obj)
                    });
                    setCommentData(list.sort(function (a, b) {
                        return a.timeStamp - b.timeStamp;
                    }))
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
        }

    }, [categoryData])

    //Get learning pathway info
    useEffect(() => {
        if (typeof categoryData.id !== 'undefined') {
            const db = firebase.firestore();
            db.collection("learning-pathways")
                .where("collectionId", "==", categoryData.id)
                .get()
                .then((snapshot) => {
                    const list = []
                    snapshot.forEach((doc, i) => {
                        const obj = doc.data()
                        Object.assign(obj, { id: doc.id });
                        list.push(obj)
                    });
                    setLearningPathwayData(list.sort(function (a, b) {
                        return a.timeStamp - b.timeStamp;
                    }))
                })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
        }

    }, [categoryData])



    async function deleteAnnotationById(id) {
        setLoading(true)
        const db = firebase.firestore()
        await deleteDoc(doc(db, "annotations", id));

        const commentsDoc = await db.collection("comments")
            .where("collectionId", "==", id)
            .get();
        commentsDoc.forEach(element => {
            element.ref.delete();
        });
        setLoading(false)
    }

    async function deleteCommentById(id) {
        setLoading(true)
        const db = firebase.firestore()
        await deleteDoc(doc(db, "comments", id));

        setLoading(false)
    }

    async function deleteLearningPathwayById(id) {
        setLoading(true)
        const db = firebase.firestore()
        await deleteDoc(doc(db, "learning-pathways", id));

        setLoading(false)
    }

    function setTourStep(name, stepIdx) {

        // Get reference to the Explorer element by id
        var voyagerElement = document.getElementById(name);

        // Call the setTourStep function with the value of the 
        // option input element as the parameter.
        // **Note the hard-coded tour index and interpolate flag.
        voyagerElement.setTourStep(0, stepIdx, true);
    }

    async function deleteModelFromCollection(id, model) {
        setLoading(true)

        const db = firebase.firestore();
        const docRef = doc(db, 'collections', id);

        await updateDoc(docRef, {
            models: arrayRemove(model)
        });
        setLoading(false)

    }

	const showCollectionPageModels = () => {

                var goo = page_size*(active-1);
                for (var i = goo; i< goo+page_size; i+=1){
                        getModel(models[i]);
                }

        }
	
	const showCurrentPageModels = () => {
		setModelData(modelData => [])
        setData(data => [])

		var goo = page_size*(active-1);
		for (var i = goo; i< goo+page_size; i+=1){
				getModel(allmodels[i]);
		}
	}
	var btns = document.getElementsByClassName("page-item");
    	for (var i = 0; i < btns.length; i++) {
        	btns[i].addEventListener("click", function() {
          		var current = document.getElementsByClassName("page-item active");
          		current[0].className = current[0].className.replace(" active", "");
          		this.className += " active";
        	});
      	}

    useEffect(() => {
		setModelData(modelData => allModelData)
		setItems([])
		for (let number = 1; number <= Math.ceil(allmodels.length / 6); number++) {
			setItems(items => [...items,
			<Pagination.Item onClick={() => { handlePageination(number) }} key={number} active={number === active}>
				{number}
			</Pagination.Item>
			])
		}
    }, [allModelData])
        
    const getModel = async (model, returnOnly=false) => {
            if (model) {
                const json = {}
                json = await fetch('https://voyager-data.create.humanities.uva.nl/' + model).then(function (response) {
                    // When the page is loaded convert it to text
                    return response.json()
                }).catch(function (err) {
                    console.log('Failed to fetch page: ', err);
                });

                if (json) {
					if (returnOnly){
						return json;
					}
                    Object.assign(json, { path: model });

                    setModelData(modelData => [...modelData, json],active)
                    setLModelData(lmodelData => [...lmodelData, json],active)
                }
            }
    }
        

    const fetchCollectionData = () => {
		var doc = document.createElement("html");
        doc.innerHTML = html;
        models = models_in_collection;
        showCollectionPageModels()
    };
	var eventKey;
	var allModelsLoaded = true;
	const fetchAllModels = (eventKey) => {
		if (eventKey == 'add-models'){
			showCurrentPageModels()
		}
	}

    //Get models in collection
    useEffect(() => {
        if (typeof categoryData.id !== 'undefined') {
            setModelArray(categoryData.models)
        }
    }, [categoryData])



    async function addModelToCollection(model) {
        if (typeof categoryData.id !== 'undefined') {

            setLoading(true)
            const db = firebase.firestore();
            const collection = doc(db, "collections", categoryData.id);

            await updateDoc(collection, {
                models: arrayUnion(model)
            });
            setLoading(false)
        }
    }

    const handlePageination = (number) => {
	    active=number;
showCurrentPageModels()
    }
    const toggleAnnotations = (modelid) => {
			var voyagerElement = document.getElementById(modelid);
			if (voyagerElement !== null ){ 
				voyagerElement.application.system.components._objLists.CVDocumentProvider[0].activeComponent.setup.viewer.ins.annotationsVisible.setValue(true);
			}
    }
    return (

        <div>
            <Row>
                <Col md={{ offset: 1 }}>
                    <h3> {categoryData.title} by {categoryData.creator} </h3>
                    <Row className='collection-models'>
                        {modelArray.map(model => (
                            <Col md={6} key={model}>
                                <Card className='spacing' >
                                    <div className="explorer-wrapper" >
                                        <voyager-explorer onModelLoad={toggleAnnotations(model)}  id={model} uimode="None" root="https://voyager-data.create.humanities.uva.nl/" document={model}></voyager-explorer>
                                    </div>

                                    <Card.Body>
                                        <Card.Title>
                                            {model.replace(".svx.json", "")}

                                        </Card.Title>

                                        <Card.Text>
                                            <Button variant="secondary" href={'/explorer.html?root=https://voyager-data.create.humanities.uva.nl/&document=' + model}> View           </Button>
                                            {'  '}
                                            {displayName && <Button variant="secondary" href={'/story.html?root=https://voyager-data.create.humanities.uva.nl/&document=' + model}> Edit           </Button>}
                                            {displayName == categoryData.creator && <Button onClick={() => deleteModelFromCollection(categoryData.id, model)} variant='secondary' className="pull-right" size="sm"><FaTrashAlt /></Button>}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                </Col>
                <Col md={5} >
                    <Tabs defaultActiveKey="collection-info" id="uncontrolled-tab-example" onSelect={(k) => fetchAllModels(k)}>
                        <Tab eventKey="collection-info" title="Collection Info">
                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Category info</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>

                                    <Form onSubmit={handleEditSubmit}>
                                        <Row  >
                                            <Col className="pull-right" >
                                                <Row className="mb-3">
                                                    <Form.Group as={Col} md="12" controlId="validationCustom01">
                                                        <Form.Label>Title</Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            value={editData.title}
                                                            name="title"
                                                            onChange={e => updateEditData(e)}
                                                        />
                                                    </Form.Group>
                                                </Row>
                                                <Row className="mb-3">
                                                    <Form.Group as={Col} md="12" controlId="validationCustom02">
                                                        <Form.Label>Description</Form.Label>
                                                        <Form.Control
                                                            required
                                                            type="text"
                                                            value={editData.description}
                                                            name="description"
                                                            onChange={e => updateEditData(e)}
                                                        />
                                                    </Form.Group>
                                                </Row>
                                                <Row className="mb-3">
                                                    <Form.Group as={Col} md="12" controlId="validationCustom03">
                                                        <Form.Label>Public access</Form.Label>
                                                        <Form.Check
                                                            type="checkbox"
                                                            checked={access}
                                                            name="access"
                                                            onChange={e => updateEditData(e)}
                                                        />
                                                    </Form.Group>
                                                </Row>

                                                <div className='spacing'></div>
                                                {/* <Button variant="secondary" disabled type="submit">Submit comments</Button> */}
                                                <Button type="submit">Submit</Button>

                                            </Col>
                                        </Row>

                                    </Form>
                                </Modal.Body>

                            </Modal>

                            <div className='spacing'></div>

                            <strong>Title </strong>

                            {displayName == categoryData.creator ?
                                <Button onClick={handleEdit} className='pull-right edit-note'><MdEditNote /></Button>
                                : <div></div>
                            }
                            <div>
                                {categoryData.title}
                            </div>


                            <div className='spacing'></div>

                            <strong>Creator </strong>
                            <div>
                                {categoryData.creator}
                            </div>
                            <div className='spacing'></div>

                            <strong>Created </strong>
                            <div>{new Date(categoryData.timeStamp).toLocaleDateString("nl-NL")}</div>
                            <div className='spacing'></div>

                            <strong>Last edit </strong>
                            <div>{new Date(categoryData.timeStamp).toLocaleDateString("nl-NL")}</div>
                            <div className='spacing'></div>

                            <strong>Description </strong>
                            <div>
                                {categoryData.description}
                            </div>
                            <div className='spacing'></div>

                            <strong>Access </strong>
                            <div>
                                {categoryData.access ? "Public" : 'Private'}
                            </div>
                            <div className='spacing'></div>


                        </Tab>
                        <Tab eventKey="annotations" title="Notes">

                            <Modal show={showComment} onHide={handleCloseComment}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add Comment</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>

                                    <Form onSubmit={handleCommentSubmit}>
                                        <Row  >
                                            <Col className="pull-right" >
                                                <Form.Group as={Col} controlId="validationCustom01">
                                                    <Form.Control
                                                        required
                                                        as="textarea"
                                                        placeholder="comment"
                                                        name="Comment"
                                                        onChange={e => updateCommentData(e)}
                                                    />

                                                </Form.Group>
                                                <div className='spacing'></div>
                                                {/* <Button variant="secondary" disabled type="submit">Submit comments</Button> */}
                                                <Button type="submit">Submit comment</Button>

                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                            </Modal>


                            <Modal show={showEditComment} onHide={handleCloseEditComment}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add Comment</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>

                                    <Form onSubmit={handleEditCommentSubmit}>
                                        <Row  >
                                            <Col className="pull-right" >
                                                <Form.Group as={Col} controlId="validationCustom01">
                                                    <Form.Control
                                                        required
                                                        as="textarea"
                                                        placeholder="comment"
                                                        name="comment"
                                                        value={editCommentData.comment}
                                                        onChange={e => updateEditCommentData(e)}
                                                    />

                                                </Form.Group>
                                                <div className='spacing'></div>
                                                <Button type="submit">Submit comment</Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Modal.Body>
                            </Modal>



                            <Modal show={showEditAnnotation} onHide={handleCloseEditAnnotation}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Note</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form onSubmit={handleEditAnnotationSubmit}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="12" controlId="validationCustom01">
                                                <Form.Label>Note title</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    value={editAnnotationData.title}
                                                    name="title"
                                                    onChange={e => updateEditAnnotationData(e)}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="12" controlId="validationCustom02">
                                                <Form.Label>Note text</Form.Label>
                                                <Form.Control
                                                    required
                                                    as="textarea"
                                                    value={editAnnotationData.annotation}
                                                    name="annotation"
                                                    onChange={e => updateEditAnnotationData(e)}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Button type="submit">Edit note</Button>
                                    </Form>
                                </Modal.Body>

                            </Modal>


                            <Modal show={showAnnotation} onHide={handleCloseAnnotation}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add Note</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form onSubmit={handleAnnotationSubmit}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="12" controlId="validationCustom01">
                                                <Form.Label>Note title</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    name="title"
                                                    onChange={e => updateAnnotationData(e)}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="12" controlId="validationCustom02">
                                                <Form.Label>Note text</Form.Label>
                                                <Form.Control
                                                    required
                                                    as="textarea"
                                                    name="annotation"
                                                    onChange={e => updateAnnotationData(e)}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Button type="submit">Submit note</Button>
                                    </Form>
                                </Modal.Body>

                            </Modal>
                            <div className='spacing'></div>


                            {displayName &&
                                <Button onClick={() => { setShowAnnotation(true) }}>Add Note</Button>
                            }
                            <div className="spacing"></div>

                            {annotationData.length < 1 && <div> Add or respond to notes </div>}
                            <Row>
                                <Col md="12">
                                    {annotationData.map(annotation => (
                                        <div key={annotation.timeStamp}>
                                            <div className='spacing'><strong>{annotation.title}</strong>
                                                <div className=' pull-right '>
                                                    {displayName && <DropdownButton variant="secondary" id="dropdown-basic-button" title="⋮" align="end">
                                                        {displayName == annotation.name &&
                                                            <Dropdown.Item onClick={() => { handleAnnotationEdit(annotation.id, annotation.title, annotation.annotation) }} >Edit</Dropdown.Item>}
                                                        <Dropdown.Item onClick={() => handleShowComment(annotation.id)} >Comment</Dropdown.Item>
                                                        {displayName == annotation.name && <Dropdown.Item onClick={() => deleteAnnotationById(annotation.id)} >Delete </Dropdown.Item>
                                                        }
                                                    </DropdownButton>
                                                    }
                                                </div>
                                            </div>
                                            <div><i> {annotation.name}</i></div>
                                            <div className="spacing"><i>{annotation.date}</i></div>
                                            <div>{annotation.annotation}</div>
                                            <hr></hr>
                                            {commentData.map(comment => {
                                                if (annotation.id == comment.annotationId) {

                                                    return <div key={comment.timeStamp} ><Row >
                                                        <Col md={{ offset: 3 }} >
                                                            <div>
                                                                <i> {comment.name} {' '} {comment.date}</i>
                                                                <div className='pull-right'>
                                                                    {displayName == comment.name &&
                                                                        <DropdownButton variant="secondary" id="dropdown-basic-button-comment" title="⋮" align="end">
                                                                            <Dropdown.Item onClick={() => { handleCommentEdit(comment.id, annotation.id, comment.comment) }} >Edit</Dropdown.Item>
                                                                            <Dropdown.Item onClick={() => deleteCommentById(comment.id)}  >Delete </Dropdown.Item>
                                                                        </DropdownButton>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div> {comment.comment}</div>
                                                            <div className='spacing'></div>
                                                            <hr></hr>
                                                        </Col>
                                                    </Row>
                                                    </div>
                                                }
                                                else {
                                                    return <div key={comment.timeStamp}></div>
                                                }
                                            })}

                                        </div>
                                    ))}
                                </Col>
                            </Row>

                        </Tab>
                        <Tab eventKey="learning-pathway" title="Learning Pathway">
                            <Modal show={showEditLearningPathway} onHide={handleCloseEditLearningPathway}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Paragraph</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form onSubmit={handleEditLearningPathwaySubmit}>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="12" controlId="validationCustom01">
                                                <Form.Label>Heading</Form.Label>
                                                <Form.Control
                                                    required
                                                    type="text"
                                                    value={editLearningPathwayData.heading}
                                                    name="heading"
                                                    onChange={e => updateEditLearningPathwayData(e)}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Row className="mb-3">
                                            <Form.Group as={Col} md="12" controlId="validationCustom02">
                                                <Form.Label>Content</Form.Label>
                                                <Form.Control
                                                    required
                                                    as="textarea"
                                                    value={editLearningPathwayData.content}
                                                    name="content"
                                                    onChange={e => updateEditLearningPathwayData(e)}
                                                />
                                            </Form.Group>
                                        </Row>
                                        <Button type="submit">Edit Paragraph </Button>
                                    </Form>
                                </Modal.Body>
                            </Modal>


                            <Modal show={showLearningPathway} onHide={handleCloseLearningPathway}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Add Learning Pathway</Modal.Title>
                                </Modal.Header>
                                <Modal.Body><Form onSubmit={handleLearningPathwaySubmit}>
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12" controlId="validationCustom01">
                                            <Form.Label>Heading</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                value={currentHeading}
                                                name="heading"
                                                onChange={e => updateLearningPathwayData(e)}
                                            />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12" controlId="validationCustom02">
                                            <Form.Label>Content</Form.Label>
                                            <Form.Control
                                                required
                                                type="text"
                                                as="textarea"
                                                value={currentContent}
                                                name="content"
                                                onChange={e => updateLearningPathwayData(e)}
                                            />
                                        </Form.Group>
                                    </Row>
                                    <Form.Label>Hyperlink to tour step</Form.Label>
                                    <div></div>

                                    <Row className="mb-3">
                                        <Form.Group as={Col} md="12" controlId="validationCustom03">
                                            <InputGroup className="mb-3">

                                                <Form.Select onChange={e => handleHyperlinkChange(e)}
                                                    name="model"
                                                    aria-label="Default select example">
                                                    <option>Select model</option>
                                                    {allmodels.map((model, index) => (
                                                        <option key={index} value={index}>{model.replace(".svx.json", "")}</option>))
                                                    }
                                                </Form.Select>
                                                {steps &&
                                                    <Form.Select name="annotations"
                                                        onChange={e => handleHyperlinkChangeStep(e)}
                                                        aria-label="Default select example">
                                                        {steps.map((model, index) => (
                                                            <option key={index} value={index}>{model.title}</option>
                                                        ))
                                                        }
                                                    </Form.Select>
                                                }

                                            </InputGroup>
                                        </Form.Group>
                                    </Row >
                                    {steps && <Button onClick={handleAddHyperlink}>Add hyperlink</Button>}
                                    {' '}
                                    {steps && <Button onClick={handleRemoveHyperlink}>Remove hyperlink</Button>}
                                    <div className="spacing"></div>
                                    Hyperlinks:
                                    <div className="spacing"></div>

                                    {hyperlinks.map((arr, index) => (
                                        < div key={index} > {hyperlinkModelToUse.path} {' '} {hyperlinkModelToUse.annotations[arr.step].title}</div>
                                    ))}
                                    < div className='spacing'></div>
                                    <Button type="submit">Submit learning pathway</Button>
                                </Form></Modal.Body>

                            </Modal>
                            <div >
                                <div className="spacing"></div>
                                {displayName == categoryData.creator && <Button className="spacing" variant="primary" onClick={handleShowLearningPathway}>
                                    Add Paragraph
                                </Button>}
                                <Row>
                                    <Col md="12">
                                        {(learningPathwayData.length) < 1 ? <div>Create a learning pathway</div> : <div><h1> Learning Pathway</h1> <div><i>Created by: {categoryData.creator}</i></div></div>}
                                        <div className="spacing"> </div>

                                        {learningPathwayData.map(learningPathway => (
                                            <div className="learning-pathway" key={learningPathway.timeStamp}>
                                                <div className='spacing'><strong><h4>{learningPathway.heading}  <div className=' pull-right '>
                                                    {displayName == categoryData.creator &&
                                                        <DropdownButton variant="secondary" id="dropdown-basic-button" title="⋮" align="end">
                                                            <Dropdown.Item onClick={() => { handleLearningPathwayEdit(learningPathway.id, learningPathway.heading, learningPathway.content) }} >Edit</Dropdown.Item>
                                                            <Dropdown.Item onClick={() => deleteLearningPathwayById(learningPathway.id)} >Delete </Dropdown.Item>
                                                        </DropdownButton>
                                                    }
                                                </div></h4></strong>

                                                </div>
                                                <div>{learningPathway.content}</div>
                                                <hr></hr>
                                                {
                                                    learningPathway.hyperlinks.map((hyperlink, index) => (
                                                        <div key={index} className="spacing">
                                                        {lmodelData[getLocalModel(hyperlink)] && lmodelData[getLocalModel(hyperlink)].models[0].annotations && lmodelData[getLocalModel(hyperlink)].models[0].annotations[hyperlink.step] ?
                                                            <button onClick={() => { setTourStep(lmodelData[getLocalModel(hyperlink)].path, hyperlink.step) }}> {getStepName(lmodelData[getLocalModel(hyperlink)].path, hyperlink.step)}</button>
                                                        : <div></div>}
                                                        </div>
                                                    )
                                                    )
                                                }
                                            </div>
                                        ))}
                                    </Col>
                                </Row>
                            </div>

                        </Tab>
                        <Tab eventKey="add-models" title="Add Models" >

                            <div className='spacing'></div>

                            {displayName == categoryData.creator &&
                                <div>
                                    <form className="spacing">
                                        <label>
                                            <strong>Search Models</strong>
                                        </label>
                                        <div className=' small'>
                                            <i>Search through titles</i>
                                        </div>
                                        <div className='spacing'></div>
                                        <label>
                                            <input type="text" name="name" onChange={handleChange} value={value} />
                                        </label>

                                    </form>
                                    <div className='pagination'>
                                        <Pagination size="sm">{items}</Pagination>
                                    </div>
                                    <Row >
                                        {
                                            modelData.map(model => (
                                                <Col className="spacing" md="5" key={model.path}>
                                                    <Card  >
                                                        <div className="collection-explorer-wrapper" >
                                                            <voyager-explorer id="voyager3" uimode="None" root="https://voyager-data.create.humanities.uva.nl/" document={model.path}></voyager-explorer>
                                                        </div>
                                                        <div className="collection-card">
                                                            <Card.Title>
                                                                {model.path.replace(".svx.json", "")}
                                                                <span className='pull-right'>
                                                                    <Button onClick={() => { addModelToCollection(model.path) }} className="add-button" size="sm"><IoMdAdd /></Button>
                                                                </span>
                                                            </Card.Title>
                                                            <Card.Text>
                                                                <Button variant="secondary" href={'/explorer.html?root=https://voyager-data.create.humanities.uva.nl/&document=' + model.path}>View Model           </Button>
                                                            </Card.Text>
                                                        </div>
                                                    </Card>
                                                </Col>
                                            ))}
                                    </Row>
                                </div>
                            }
                            {displayName != categoryData.creator && <div>Login to search and add models. You can only add models to your own collections.</div>}
                            <div className='spacing'></div>
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
        </div >
    )
}
