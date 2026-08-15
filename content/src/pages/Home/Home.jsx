import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
    return (
        <div className="home">
            <h1>Welcome to My Research Library</h1>
            <p>A collection of self-directed research exercises in
                Molecular Biology, Genomics and Bioinformatics.
                Each exercise is based on peer-reviewed literature and
                publicly available bioinformatics resources.
            </p>
            <hr className='divider' />
            <p>Click below to view exercises.</p>
            {/*<div className="practice">
                <div>
                    <p><strong>Tumour Suppressor Gene (TP53)</strong></p>
                    <Link to="/practice-one">[Open]</Link>
                </div>
                <p>3 exercises</p>
            </div>*/}
        </div>
    )
}

export default Home