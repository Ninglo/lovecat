import React, { Dispatch, FC, SetStateAction, useEffect, useReducer, useState } from 'react';
import { VSCodeButton, VSCodeTextField, VSCodeTextArea, VSCodeDivider } from '@vscode/webview-ui-toolkit/react'
import './App.scss';

const Header: FC = () => {
  return <header className='header'>
    MIMI
    <div>

    </div>
  </header>
}

const List: FC<{ articles: IArticles, setCurt: Dispatch<SetStateAction<IArticle>> }> = ({ articles: { name, content }, setCurt }) => {
  const add = () => {
    setCurt({
      title: '',
      content: ''
    })
  }
  return <div className='list'>
    <div className='list-title'>
      <div className='name'>{name}</div>
      <div className='add-icon' onClick={add}>+</div>
    </div>
    {content.map(article =>
      <div className='title' key={article.content} onClick={() => setCurt(article)}>
        {article.title}
      </div>)}
  </div>
}

const Article: FC<{ article: IArticle, save: (article: IArticle) => void }> = ({ article, save }) => {
  const [isEditable, setIsEditable] = useState(!article.title)
  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)
  const paragraphs = article.content.split('\n')
  const reset = () => {
    setTitle(article.title)
    setContent(article.content)
    setIsEditable(false)
  }

  useEffect(() => {
    setIsEditable(!article.title)
    setTitle(article.title)
    setContent(article.content)
  }, [article])

  return <div className='article-div'>
    {isEditable ?
      <VSCodeButton className='edit-btn' onClick={reset}>
        Cancel
      </VSCodeButton>
      : <VSCodeButton className='edit-btn' onClick={() => setIsEditable(true)}>
        Edit
      </VSCodeButton>}
    {isEditable ?
      (<div className='article edit-article'>
        <VSCodeTextField className="title-field" type="text" value={title} onChange={(e) => setTitle((e?.target as any)?.value ?? title)} />
        <VSCodeDivider />
        <VSCodeTextArea className="content-field" rows={15} resize='vertical' value={content} onChange={(e) => setContent((e?.target as any)?.value ?? title)} />
      </div>)
      : (<div className='article'>
        <h1>{article.title}</h1>
        <VSCodeDivider />
        {paragraphs.map((p) => <p>{p}</p>)}
      </div>)
    }
    <VSCodeButton className='save-btn' onClick={() => {
      save({ title, content })
      setIsEditable(false)
      setTitle(title)
      setContent(content)
    }}>Save</VSCodeButton>
  </div >
}

interface IArticle {
  title: string;
  content: string;
}

interface IArticles {
  name: string
  content: IArticle[]
}
const getArticles = (): IArticles => {
  const articlesStr = localStorage.getItem('cat') || '{"name":"cat","content":[{"title":"520","content":"生日快乐哦我的猫！"},{"title":"喵喵","content":"猫猫爱我！"},{"title":"咪咪","content":"我爱贝贝\\n"}]}'
  const articles = JSON.parse(articlesStr)

  return articles
}

const setArticles = (articles: IArticles) => {
  localStorage.setItem('cat', JSON.stringify(articles))
}

type ActionType = 'save'
type ArticleReducer = (state: IArticles, action: { type: ActionType, article: IArticle }) => IArticles
const articleReducer: ArticleReducer = (state, { type, article }) => {
  switch (type) {
    case 'save':
      const res = { ...state, content: [article].concat(state.content.filter(item => item.title !== article.title)) }
      setArticles(res)
      return res
  }
}

const Main: FC = () => {
  const [articles, dispatchArticles] = useReducer(articleReducer, null, () => getArticles())
  const [curtArticle, setCurtArticle] = useState(articles.content[0] ?? { title: '', content: '' })

  return <main className='main'>
    <List articles={articles} setCurt={setCurtArticle} />
    <Article article={curtArticle} save={(article: IArticle) => {
      dispatchArticles({ type: 'save', article })
      setCurtArticle(article)
    }} />
  </main>
}

function App() {
  return <>
    <Header />
    <Main />
  </>
}

export default App;
