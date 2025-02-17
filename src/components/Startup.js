import React from 'react';
import PostCard from './PostCard';
import CommentCard from './CommentCard';
import { withParams } from '../helpers/hooks';
import * as config from '../helpers/config';
import { Link } from 'react-router-dom';

class Startup extends React.Component {

    state = {
        startup: {
            imageLinks: [],
            id: undefined
        },
        posts: [],
        comments: [],
        applications: [],
        rewards: [],
        commentDraft: "",
        funds: 0,
        isApply: false,
        isDonate: false,
        applyDesc: '',
        isApplicant: false,
        user_id: null,
    }

    async init() {
        fetch(config.url + '/api/business/current_user', {
            headers: {
                Authorization: 'Bearer ' + window.token
            }
        }).then((res) => res.json()).then((result) => {
            if (!result.status) {
                this.setState({
                    isApplicant: result.roles.some((role) => role.type === 'APPLICANT'),
                    user_id: result.id,
                });
            }
        });

    }

    componentDidMount = () => {
        fetch(config.url + '/api/feed/api/startup/' + this.props.params.id, {
            headers: {
                'Authorization': `Bearer ${window.token}`
            },
        })
            .then(res => res.json())
            .then((result) => {
                if (!result.error) {
                    this.setState({
                        startup: result
                    });
                    this.props.onTitleChanged(this.state.startup.name);
                }
            });

        fetch(config.url + '/api/business/startup_applications?startup_id=' + this.props.params.id, {
            headers: {
                'Authorization': `Bearer ${window.token}`
            },
        })
            .then(res => res.json())
            .then((result) => {
                if (!result.error) {
                    this.setState({
                        application: result
                    });
                }
            });

        fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + '/posts/', {
            headers: {
                'Authorization': `Bearer ${window.token}`
            },
        })
            .then(res => res.json())
            .then((result) => {
                if (!result.status)
                    this.setState({
                        posts: result
                    });
            });

        this.updateComments();
        this.init()
    }

    updateComments = () => {
        fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + '/comments/', {
            headers: {
                'Authorization': `Bearer ${window.token}`
            },
        })
            .then(res => res.json())
            .then((result) => {
                if (!result.status)
                    this.setState({
                        comments: result
                    });
            });
    }

    handleLikeClick = () => {
        if (this.state.startup.liked) {
            fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + "/like", {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${window.token}`
                },
            })
                .then(res => res.json())
                .then((result) => {
                    this.setState({
                        startup: { ...this.state.startup, likes: result.likes, liked: result.liked }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + "/like", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${window.token}`
                },
            })
                .then(res => res.json())
                .then((result) => {
                    this.setState({
                        startup: { ...this.state.startup, likes: result.likes, liked: result.liked }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    handleFollowClick = () => {
        if (this.state.startup.followed) {
            fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + "/follow", {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${window.token}`
                },
            })
                .then(res => res.json())
                .then((result) => {
                    this.setState({
                        startup: { ...this.state.startup, follows: result.follows, followed: result.followed }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + "/follow", {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${window.token}`
                },
            })
                .then(res => res.json())
                .then((result) => {
                    this.setState({
                        startup: { ...this.state.startup, follows: result.follows, followed: result.followed }
                    });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    handleCommentInput = (event) => {
        this.setState({
            commentDraft: event.target.value,
        });
    }

    handleChangeDonate = (event) => {
        this.setState({
            funds: event.target.value
        });
    }

    handleSubmitDonate = async () => {
        if (this.state.funds === 0) {
            return;
        }
        let req
        try {
            req = await fetch(config.url + '/api/business/donate?startup_id=' + this.props.params.id + '&amount=' + this.state.funds,
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + window.token
                    }
                })
        }
        catch (e) {
            console.log(e)
            return
        }
        if (!req.ok)
            req.text().then(function (text) {
                console.log(text)
            });
        else {
            let data = await req.json()
            window.open('http://' + data.link, '_blank').focus()
        }
    }

    handleVaccancySubmit = async () => {
        let req
        let fd = new FormData()
        fd.append('message', this.state.applyDesc)
        try {
            req = await fetch(config.url + '/api/business/apply_startup?startup_id=' + this.props.params.id,
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + window.token
                    }, body: fd
                })
        }
        catch (e) {
            console.log(e)
            return
        }
        if (!req.ok)
            req.text().then(function (text) {
                console.log(text)
            });
        else {
            alert('Заявка подана!')
        }
    }

    handleOpenVaccancyClick = () => {
        this.setState({
            isApply: !this.state.isApply,
            isDonate: false
        })
    }

    handleOpenDonateClick = () => {
        this.setState({
            isApply: false,
            isDonate: !this.state.isDonate
        })
    }

    handleApplyDescChanged = (event) => {
        this.setState({
            applyDesc: event.target.value
        })
    }

    postComment = () => {
        if (this.state.commentDraft === '') {
            return;
        }

        fetch(config.url + '/api/feed/api/startup/' + this.props.params.id + '/comment', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.token}`,
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                repliedId: null,
                text: this.state.commentDraft,
            }),
        })
            .then(res => res.json())
            .then((result) => {
                this.setState({
                    comments: [...this.state.comments, result]
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }

    cardBottom() {
        if (this.state.isApply && this.state.isApplicant) return (
            <div className='desc-vac-input text-center'>
                <label htmlFor='desc' className='font-bold mr-2 mb-2 block'>Напишите о ваших навыках и мотивации работать в этой компании:</label>
                <textarea cols='40' rows='5' id='desc' className='border border-solid rounded-sm w-80 h-20' onChange={this.handleApplyDescChanged} />
                <button onClick={this.handleVaccancySubmit} className='enter-button block mx-auto py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>Отправить</button>
            </div>)
        else if (this.state.isDonate) return (
            <div className='donation-form text-center mb-7'>
                <label htmlFor='donate' className='font-bold mr-2 mb-5 mt-5 block'>Размер пожертвования:</label>
                <input type='text' onChange={this.handleChangeDonate} id='donate' className='border border-solid rounded-sm' />
                <button onClick={this.handleSubmitDonate} className='enter-button ml-5 py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>Пожертвовать!</button>
            </div>)
        else return null
    }

    render() {
        return (
            <div>
                <div className="max-w-2xl mx-auto my-5 rounded-xl overflow-hidden shadow-dark shadow-sm bg-card">
                    {this.state.startup.imageLinks.map(link => (
                        <img key={link} className='w-full' src={config.url + "/api/media/api/media/download/" + link} alt="startup"></img>
                    ))}
                    <div className='p-2'>
                        <div className="font-medium text-lg">{this.state.startup.name}</div>
                        <div className="text-light">{this.state.startup.userName} {this.state.startup.userSurname}</div>
                        <div className="flex my-1">
                            {this.state.startup.status === 'Published' &&
                                <div className="flex-1 h-6 bg-dark rounded-full">
                                    <div className="h-6 px-2 bg-blue rounded-full text-white text-right" style={{ width: Math.min(this.state.startup.totalFunded * 100 / this.state.startup.fundsGoal, 100) + "%" }}>{this.state.startup.totalFunded}</div>
                                </div>
                            }
                            <div className="ml-2">из {this.state.startup.fundsGoal}</div>
                        </div>
                        <p className='overflow-hidden break-words'>{this.state.startup.description}</p>
                        <div className="mt-2 text-center">
                            {this.state.startup.status === 'Published' &&
                                <button className={"p-1 px-2 rounded-full bg-gray-200 hover:bg-blue hover:text-white " + (this.state.startup.liked ? 'bg-blue text-white' : '')} onClick={this.handleLikeClick}>{this.state.startup.likes} лайков</button>
                            }
                            {this.state.startup.status === 'Published' &&
                                <button className={"p-1 px-2 rounded-full bg-gray-200 hover:bg-blue hover:text-white " + (this.state.startup.followed ? 'bg-blue text-white' : '')} onClick={this.handleFollowClick}>{this.state.startup.follows} подписок</button>
                            }
                            {this.state.startup.status === 'Published' &&
                                <button className="p-1 px-2 rounded-full bg-gray-200 hover:bg-blue hover:text-white" onClick={this.handleOpenDonateClick}>Сделать пожертвование</button>
                            }
                            {this.state.isApplicant && this.state.startup.status === 'Published' &&
                                <button className="p-1 px-2 rounded-full bg-gray-200 hover:bg-blue hover:text-white" onClick={this.handleOpenVaccancyClick}>Откликнуться на вакансию</button>
                            }
                            {this.state.user_id === this.state.startup.userId && this.state.startup.status === 'Published' &&
                                <Link to={'/startup/' + this.state.startup.id + '/create_post'}><div className="inline-block p-1 px-2 rounded-full bg-gray-200 hover:bg-blue hover:text-white">Создать пост</div></Link>
                            }
                            {this.state.user_id === this.state.startup.userId && this.state.startup.status === 'Created' &&
                                <Link to={'/startup/' + this.state.startup.id + '/request_moderation'}><div className="inline-block p-1 px-2 rounded-full bg-gray-200 hover:bg-blue hover:text-white">Отправить на модерацию</div></Link>
                            }
                        </div>
                        {this.cardBottom()}
                    </div>
                </div>
                <div className='news mt-5'>
                    <h2 className='font-bold text-2xl text-center'>Новости</h2>
                    {this.state.posts.map(post => { return <PostCard key={post.id} post={post} /> })}
                </div>
                <div className='comments mt-10'>
                    <h2 className='font-bold text-2xl text-center'>Комментарии</h2>
                    <textarea onChange={this.handleCommentInput} className='w-full max-w-xl mx-auto my-5 p-1 h-40 rounded-xl block overflow-hidden shadow-dark shadow-sm' placeholder='Напишите ваш комментарий'></textarea>
                    <button className='mx-auto my-5 p-2 block rounded-xl text-xl text-center bg-gray-200 shadow-dark shadow-sm hover:bg-blue hover:text-white'
                        onClick={this.postComment}>Отправить</button>
                    {this.state.comments.map(comment => { return <CommentCard key={comment.id} comment={comment} /> })}
                </div>
                <div className='news mt-5'>
                    <h2 className='font-bold text-2xl text-center'>Заявки на работу</h2>
                    {this.state.applications.map(application => {
                        return (
                            <div key={application.id} className='card bg-card border-solid mx-auto relative w-1/2 h-auto px-2 py-5 mb-20'>
                                <div className='text-center'>
                                    <p>Id: {application.id}</p>
                                </div>
                                {this.state.user_id === this.state.startup.userId &&
                                    <div className='text-center'>
                                        <button className='mt-10 mb-5 py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'>Одобрить</button>
                                    </div>
                                }
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default withParams(Startup);