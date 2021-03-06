import React, { PureComponent } from 'react'
import { connect } from 'dva'
import styled from 'styled-components'

import { Archive, Quote, Loading } from '../components'
import { shuffle } from '../utils'
import config from '../config'

const { duration, transitions, qoutes, themeColors } = config
const { show, hide } = transitions.page
const newColors = shuffle(themeColors)

const Container = styled.div`
  margin: 0 auto;
  @media (max-width: 900px) {
    width: 96%;
  }
`

const Wapper = styled.div`
  display: ${props => props.onHide ? 'none' : 'block'};
  padding: .16rem;
  border-radius: .03rem;
  box-shadow: 0 3px 6px rgba(0, 0, 0, .16), 0 3px 6px rgba(0, 0, 0, .24);
  background: rgba(255, 255, 255, .6);
  animation-duration: ${duration / 1000}s;
  animation-fill-mode: forwards;
`

const Button = styled.button`
  margin: 0 .04rem .1rem;
  padding: .08rem .12rem;
  font-size: .14rem;
  text-align: center;
  text-decoration: none;
  outline: 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  border: none;
  border-radius: .03rem;
  background: rgba(0, 0, 0, .12);
  &:hover {
    background: rgba(0, 0, 0, .2);
  }
`

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
`

const Tag = Button.extend`
  color: ${props => props.color || '#fff'};
`

const CloseBtn = Button.extend`
  color: ${props => props.color || '#666'};
  i {
    color: #f6f;
    margin-left: .06rem;
  }
`

const Title = styled.div`
  h2 {
    display: inline-block;
    margin-right: .12rem;
    font-size: .2rem;
    font-weight: 700;;
  }
`

const ArchiveList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 700px) {
    justify-content: space-around;
  }
`

class Tags extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'page/queryTags',
    })

    // 动画监听
    this.performAndDisapper()
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'page/reset',
      payload: {
        tagsOnHide: true,
        tags: [],
        filterTitle: '',
        filterPost: [],
      },
    })
  }

  // 监听动画结束，其他方法都太复杂了QAQ
  performAndDisapper = () => {
    if (!this.ACom) this.ACom = document.getElementById('ACom');
    this.ACom.addEventListener('animationend', this.animationEnd)
  }

  // 动画结束
  animationEnd = () => {
    const { loading } = this.props
    if (loading) {
      this.props.dispatch({
        type: 'page/update',
        payload: {
          tagsOnHide: true,
        },
      })
    }
  }

  filterPost = tag => {
    this.performAndDisapper()
    this.props.dispatch({
      type: 'page/filterPost',
      payload: {
        type: 'labels',
        filter: tag,
        filterTitle: tag,
      },
    })
  }

  clearFilter = () => {
    this.props.dispatch({
      type: 'page/update',
      payload: {
        tagsOnHide: false,
        filterTitle: '',
        filterPost: [],
      },
    })
  }

  render() {
    const {
      loading,
      tagsOnHide,
      tags,
      filterTitle,
      filterPost,
    } = this.props
    return (
      <Container>
        <Wapper
          id="ACom"
          className={loading ? hide : show}
          onHide={tagsOnHide}
        >
          {!!filterPost.length
            ? <div>
                <Title>
                  Tag:{' '}
                  <CloseBtn onClick={this.clearFilter}>
                    {filterTitle}
                    <i className="fa fa-times" aria-hidden="true"></i>
                  </CloseBtn>
                </Title>
                <ArchiveList>
                  {
                    filterPost.map((o, i) => {
                      const color = newColors[i]
                      return (
                        <Archive key={o.id} color={color} archive={o} />
                      )
                    })
                  }
                </ArchiveList>
              </div>
            : <div>
                <Quote text={qoutes.tags} />
                <TagList>
                  {
                    tags.map((o, i) => {
                      const color = newColors[i % newColors.length]
                      return (
                        <Tag key={o.id} color={color} onClick={() => this.filterPost(o.name)}>
                          {o.name}
                        </Tag>
                      )
                    })
                  }
                </TagList>
              </div>
          }
        </Wapper>
        {loading && tagsOnHide && <Loading />}
      </Container>
    )
  }
}

export default connect(({ loading, page }) => ({
  // loading: loading.models.page,
  loading: loading.effects['page/queryTags'] || loading.effects['page/filterPost'],
  ...page,
}))(Tags)
