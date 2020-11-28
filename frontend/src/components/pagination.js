import React from 'react'



const Pagination = ({ postsPerPage, totalPosts, Paginate }) => {
    const pageNumbers = []

    for (let i = 1; i <= Math.ceil(totalPosts/postsPerPage); i++) {
        pageNumbers.push(i)
    }

    return (
        <nav aria-label="Page navigation example" className='pagination-nav'>
            <ul className='pagination'>
                {pageNumbers.map(number => (
                    <li key={number} className='page-item'>
                        <button onClick={() => Paginate(number)} className='page-link'>{number}</button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}



export default Pagination