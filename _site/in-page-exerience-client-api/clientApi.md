<a name="ClientApi"></a>

## ClientApi
<h3>Represents browser API for Gallery IPX.</h3>
<p>
The API is available on any page that runs one or more Brightcove embedded experiences.
It is designed to help 3rd parties with Brightcove experiences integration.
Provides access to current player, videos and state information as well as
listeners for playback-related events.
</p>
<p>
Before accessing the Client API, you will need to get the correct embedded IPX on the page.
The API can be accessed by the id of the <div> element you used when you embedded it
by running:
</p>
<p>
 <strong>window.top.bcov.gal.getEmbed(bc-embed-<i>exp_id</i>).clientApi,</strong>
where <i>exp_id</i> is the experience id.
</p>
<p>
You can also get an object with all IPX available on a page by running <strong>window.top.bcov.gal.getEmbeds()</strong>.
</p>

**Kind**: global class  

* [ClientApi](#ClientApi)
    * _instance_
        * [.getCurrentVideo()](#ClientApi+getCurrentVideo) ⇒ [<code translate="no">Video</code>](#ClientApi..Video)
        * [.getCurrentState()](#ClientApi+getCurrentState) ⇒ <code translate="no">string</code>
        * [.getAllVideos()](#ClientApi+getAllVideos) ⇒ [<code translate="no">Array.&lt;Video&gt;</code>](#ClientApi..Video)
        * [.on(Name, callback)](#ClientApi+on)
        * [.once(Name, callback)](#ClientApi+once)
        * [.off(Name, callback)](#ClientApi+off)
        * ["playerChanged"](#ClientApi+event_playerChanged)
        * ["videoChanged"](#ClientApi+event_videoChanged)
        * ["stateChanged"](#ClientApi+event_stateChanged)
        * ["playerLoaded"](#ClientApi+event_playerLoaded)
        * ["videoLoaded"](#ClientApi+event_videoLoaded)
        * ["videoStarted"](#ClientApi+event_videoStarted)
        * ["videoPaused"](#ClientApi+event_videoPaused)
        * ["interactionStart"](#ClientApi+event_interactionStart)
        * ["interactionEnd"](#ClientApi+event_interactionEnd)
        * ["interactionClick"](#ClientApi+event_interactionClick)
        * ["interactionCardPanelOpen"](#ClientApi+event_interactionCardPanelOpen)
        * ["interactionCardPanelClose"](#ClientApi+event_interactionCardPanelClose)
    * _inner_
        * [~Player](#ClientApi..Player) : <code translate="no">Object</code>
        * [~Video](#ClientApi..Video) : <code translate="no">Object</code>
        * [~InteractivityEvent](#ClientApi..InteractivityEvent) : <code translate="no">Object</code>

<a name="ClientApi+getCurrentVideo"></a>

### clientApi.getCurrentVideo() ⇒ [<code translate="no">Video</code>](#ClientApi..Video)
Returns currently playing video or the last video that was played

**Kind**: instance method of [<code translate="no">ClientApi</code>](#ClientApi)  
**Returns**: [<code translate="no">Video</code>](#ClientApi..Video) - Video Metadata object  
<a name="ClientApi+getCurrentState"></a>

### clientApi.getCurrentState() ⇒ <code translate="no">string</code>
Returns current state of the IPX

**Kind**: instance method of [<code translate="no">ClientApi</code>](#ClientApi)  
**Returns**: <code translate="no">string</code> - State name, for example 'before' or 'after' for Live Event IPX  
<a name="ClientApi+getAllVideos"></a>

### clientApi.getAllVideos() ⇒ [<code translate="no">Array.&lt;Video&gt;</code>](#ClientApi..Video)
Returns current list of all videos, available for the current state

**Kind**: instance method of [<code translate="no">ClientApi</code>](#ClientApi)  
**Returns**: [<code translate="no">Array.&lt;Video&gt;</code>](#ClientApi..Video) - Array of Video Metadata objects  
<a name="ClientApi+on"></a>

### clientApi.on(Name, callback)
Allows to register a callback for an embedded experience event.

**Kind**: instance method of [<code translate="no">ClientApi</code>](#ClientApi)  

| Param | Type | Description |
| --- | --- | --- |
| Name | <code translate="no">string</code> | of the event. |
| callback | <code translate="no">function</code> |  |

<a name="ClientApi+once"></a>

### clientApi.once(Name, callback)
Allows to register a one-time callback function for the event named eventName.
The next time eventName is triggered, this callback is removed and then invoked.

**Kind**: instance method of [<code translate="no">ClientApi</code>](#ClientApi)  

| Param | Type | Description |
| --- | --- | --- |
| Name | <code translate="no">string</code> | of the event. |
| callback | <code translate="no">function</code> |  |

<a name="ClientApi+off"></a>

### clientApi.off(Name, callback)
Removes the specified listener callback from the listener array for the event named eventName.

**Kind**: instance method of [<code translate="no">ClientApi</code>](#ClientApi)  

| Param | Type | Description |
| --- | --- | --- |
| Name | <code translate="no">string</code> | of the event. |
| callback | <code translate="no">function</code> |  |

<a name="ClientApi+event_playerChanged"></a>

### "playerChanged"
playerChanged event. Emitted when a different player is going to be used for playback.
Can be generated multiple times for experiences that have multiple players.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Player</code>](#ClientApi..Player) |

<a name="ClientApi+event_videoChanged"></a>

### "videoChanged"
videoChanged event. Emitted when current video has changed.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Video</code>](#ClientApi..Video) |

<a name="ClientApi+event_stateChanged"></a>

### "stateChanged"
stateChanged event. Emitted when a state of the embed experience is changed,
for example from "Pre-event" to "Live".

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Param | Type | Description |
| --- | --- | --- |
| state. | <code translate="no">string</code> | Currently supported states: before, during, after, playback. |

<a name="ClientApi+event_playerLoaded"></a>

### "playerLoaded"
playerLoaded event. Emitted when a player is loaded.
Can be generated multiple times for experiences that have multiple players.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Player</code>](#ClientApi..Player) |

<a name="ClientApi+event_videoLoaded"></a>

### "videoLoaded"
videoLoaded event. Emitted when video is fully loaded and ready to play.
Can be generated multiple times when user changes the video

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Video</code>](#ClientApi..Video) |

<a name="ClientApi+event_videoStarted"></a>

### "videoStarted"
videoStarted event. Emitted when a video playback is started by user

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Video</code>](#ClientApi..Video) |

<a name="ClientApi+event_videoPaused"></a>

### "videoPaused"
videoPaused event. Emitted when a video playback is paused by user

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Video</code>](#ClientApi..Video) |

<a name="ClientApi+event_interactionStart"></a>

### "interactionStart"
interactionStart event. Emitted when a video interactivity element, like card or a link appears in the video.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">InteractivityEvent</code>](#ClientApi..InteractivityEvent) |

<a name="ClientApi+event_interactionEnd"></a>

### "interactionEnd"
interactionEnd event. Emitted when a video interactivity element, like card or a link disappears from the video.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">InteractivityEvent</code>](#ClientApi..InteractivityEvent) |

<a name="ClientApi+event_interactionClick"></a>

### "interactionClick"
interactionClick event. Emitted when user has clicked on an interactivity element.
This includes both video interactions as well as custom HTML and image links.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">InteractivityEvent</code>](#ClientApi..InteractivityEvent) |

<a name="ClientApi+event_interactionCardPanelOpen"></a>

### "interactionCardPanelOpen"
interactionCardPanelOpen event. Emitted when user clicked on the interactivity information link.
All active interactions become visible in the side panel.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Array.&lt;InteractivityEvent&gt;</code>](#ClientApi..InteractivityEvent) |

<a name="ClientApi+event_interactionCardPanelClose"></a>

### "interactionCardPanelClose"
interactionCardPanelClose event. Emitted when user closed the interactivity information side panel.

**Kind**: event emitted by [<code translate="no">ClientApi</code>](#ClientApi)  

| Type |
| --- |
| [<code translate="no">Array.&lt;InteractivityEvent&gt;</code>](#ClientApi..InteractivityEvent) |

<a name="ClientApi..Player"></a>

### ClientApi~Player : <code translate="no">Object</code>
See [Player Documentation](https://brightcovelearning.github.io/Brightcove-API-References/brightcove-player/current-release/Player.html) for more information about the Player object.

**Kind**: inner typedef of [<code translate="no">ClientApi</code>](#ClientApi)  
<a name="ClientApi..Video"></a>

### ClientApi~Video : <code translate="no">Object</code>
See [Video Metadata Information] [https://support.brightcove.com/video-metadata-mediainfo](https://support.brightcove.com/video-metadata-mediainfo) for more information about the video format.
for detailed description

**Kind**: inner typedef of [<code translate="no">ClientApi</code>](#ClientApi)  
<a name="ClientApi..InteractivityEvent"></a>

### ClientApi~InteractivityEvent : <code translate="no">Object</code>
Describes current status of an interactivity event. Includes information about the interactivity as well as it's position in the video

**Kind**: inner typedef of [<code translate="no">ClientApi</code>](#ClientApi)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| element | <code translate="no">string</code> | type of the interaction. For example, 'link', 'card', 'html', 'image' |
| linkText | <code translate="no">string</code> | link text if applicable |
| linkUrl | <code translate="no">string</code> | link URL if applicable |
| videoId | <code translate="no">number</code> | current video id |
| videoTitle | <code translate="no">string</code> | current video title |
| videoTime | <code translate="no">number</code> | playback position for the current video |
