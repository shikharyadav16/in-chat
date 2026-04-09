import { Outlet, useParams } from 'react-router-dom';
import "../styles/home.css"
import ContactList from '../features/contacts/ContactList';
import SearchResult from '../features/contacts/SearchResult';
import { useContacts } from '../features/contacts/useContacts';
import ContactsContext from '../context/ContactsContext';
import SidebarCtxMenu from '../components/ui/SidebarCtxMenu';
import { useEffect, useState, useRef } from 'react';

export default function Home() {

    // const socket = useContext(SocketContext);

    const { roomId } = useParams()
    const isMobileChatOpen = Boolean(roomId);
    const { contactList, setContactList, loading, error } = useContacts();

    // const[hideOverlay, setHideOverlay] = useState(true)
    const [hideSidebarMenu, setHideSidebarMenu] = useState(true);
    const sidebarMenuRef = useRef(null);

    useEffect(() => {

        const handleClickOutside = (event) => {
            if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(event.target) && !event.target.closest(".icon-btn")) {
                setHideSidebarMenu(true);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    return (
        <ContactsContext.Provider value={{ contactList, setContactList, loading, error }}>

            <div className="app-wrapper">
                <div className="desktop-shell">

                    <div className={`sidebar ${isMobileChatOpen ? 'hidden-mobile' : ''}`} id="sidebar">

                        <div className="sidebar-header">
                            <div className="sidebar-logo">

                                {/* <img className="logo-icon" src="https://t4.ftcdn.net/jpg/06/08/55/73/360_F_608557356_ELcD2pwQO9pduTRL30umabzgJoQn5fnd.jpg" alt="err" /> */}
                                <span>Hello,&nbsp;&nbsp;Shikhar <span>👋</span></span>
                            </div>
                            <div className="sidebar-actions">
                                <button className="icon-btn" title="New Chat"><i className="fas fa-pen-to-square"></i></button>
                                <button className={`icon-btn ${!hideSidebarMenu ? "active" : ""}`} title="Menu" onClick={(e) => { e.stopPropagation(); setHideSidebarMenu(prev => !prev) }}><i className="fas fa-ellipsis-vertical"></i></button>
                            </div>
                        </div>

                        <div className="sidebar-tabs">
                            <div className="sidebar-tab active" >Chats</div>
                            <div className="sidebar-tab" >Status</div>
                            <div className="sidebar-tab" >Calls</div>
                        </div>

                        <div className="search-wrap">
                            <div className="search-box">
                                <i className="fas fa-magnifying-glass"></i>
                                {/* <input type="text" placeholder="Search or start new chat" id="searchInput" oninput="filterChats(this.value)" /> */}
                                <input type="text" placeholder="Search" id="searchInput" />
                            </div>
                        </div>

                        {/* ---------------
                        ---- Contact Section ------
                        --------------- */}

                        <ContactList />

                        {/* ---------------
                        ---- Search Chats Section ------
                        --------------- */}

                        {/* <SearchResult /> */}


                        {/* ------
                        Sidebar Menu
                        ------ */}


                        <SidebarCtxMenu ref={sidebarMenuRef} hidden={hideSidebarMenu} />



                        <div className="page hidden" id="page-status">
                            <div className="status-page">
                                <div className="status-my">
                                    <div className="status-add-btn"><i className="fas fa-plus"></i></div>
                                    <div>
                                        <div className="contact-name">My Status</div>
                                        <div className="contact-preview">Add to my status</div>
                                    </div>
                                </div>
                                <div className="section-label">Recent Updates</div>
                                <div id="statusList"></div>
                            </div>
                        </div>

                        <div className="page hidden" id="page-calls">
                            <div className="calls-page" id="callsList"></div>
                        </div>

                        {/* <div className="mobile-tabs">
                            <div className="mob-tab active" id="mtab-chats" onclick="mobileSwitchTab('chats')">
                                <i className="fas fa-message"></i><span>Chats</span>
                            </div>
                            <div className="mob-tab" id="mtab-status" onclick="mobileSwitchTab('status')">
                                <i className="fas fa-circle-dot"></i><span>Status</span>
                            </div>
                            <div className="mob-tab" id="mtab-calls" onclick="mobileSwitchTab('calls')">
                                <i className="fas fa-phone"></i><span>Calls</span>
                            </div>
                            <div className="mob-tab" id="mtab-settings" onclick="mobileSwitchTab('settings')">
                                <i className="fas fa-gear"></i><span>Settings</span>
                            </div>
                        </div> */}
                        <div className="mobile-tabs">
                            <div className="mob-tab active" id="mtab-chats">
                                <i className="ph-bold ph-chat"></i><span>Chats</span>
                            </div>
                            <div className="mob-tab" id="mtab-status" >
                                <i className="ph-bold ph-play-circle"></i><span>Status</span>
                            </div>
                            <div className="mob-tab" id="mtab-calls">
                                <i className="ph-bold ph-phone"></i><span>Calls</span>
                            </div>
                            <div className="mob-tab" id="mtab-settings">
                                <i className="ph-bold ph-gear-six"></i><span>Settings</span>
                            </div>
                        </div>

                    </div>

                    <div className={`chat-area ${isMobileChatOpen ? 'visible-mobile' : ''} `} id="chatArea" >

                        {/* ------------ */}
                        {/* ----- Chat area ----- */}

                        <Outlet />


                    </div>
                </div>


            </div>

            {/* ------
                Additional Menu
                ------ */}






            {/* <div className="ctx-menu" id="chatMenu" style={{ display: "none" }}>
                <div className="ctx-item" ><i className="fas fa-magnifying-glass"></i> Search</div>
                <div className="ctx-item" ><i className="fas fa-bell-slash"></i> Mute Notifications</div>
                <div className="ctx-item" ><i className="fas fa-thumbtack"></i> Pin Chat</div>
                <div className="ctx-item" ><i className="fas fa-box-archive"></i> Archive Chat</div>
                <div className="ctx-item" ><i className="fas fa-image"></i> Wallpaper</div>
                <div className="ctx-item danger" ><i className="fas fa-trash"></i> Delete Chat</div>
            </div> */}

            {/* <div className="spotlight" id="spotlight" onclick="closeSpotlightIfOutside(event)">
                <div className="spotlight-box">
                    <div className="spotlight-input">
                        <i className="fas fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search contacts, messages..." id="spotlightInput" oninput="spotlightSearch(this.value)" autofocus />
                        <button className="icon-btn dark" onclick="closeSpotlight()" style="flex-shrink:0;"><i className="fas fa-xmark"></i></button>
                    </div>
                    <div className="spotlight-results" id="spotlightResults"></div>
                </div>
            </div> */}

            {/* <div className="spotlight" id="spotlight">
                <div className="spotlight-box">
                    <div className="spotlight-input">
                        <i className="fas fa-magnifying-glass"></i>
                        <input type="text" placeholder="Search contacts, messages..." id="spotlightInput" autoFocus />
                        <button className="icon-btn dark" style={{ flexShrink: "0" }}><i className="fas fa-xmark"></i></button>
                    </div>
                    <div className="spotlight-results" id="spotlightResults"></div>
                </div>
            </div> */}

            {/* <div className="overlay" id="overlay" onclick="closeAll()"></div> */}

        </ContactsContext.Provider>
    )
}