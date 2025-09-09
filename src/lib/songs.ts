export type Song = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  lyrics: string;
};

const songs: Song[] = [
  {
    id: '1',
    slug: 'amazing-grace',
    title: 'Amazing Grace',
    artist: 'John Newton',
    lyrics: `Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found;
Was blind, but now I see.

'Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed.

Through many dangers, toils, and snares,
I have already come;
'Tis grace hath brought me safe thus far,
And grace will lead me home.

The Lord has promised good to me,
His Word my hope secures;
He will my Shield and Portion be,
As long as life endures.

Yea, when this flesh and heart shall fail,
And mortal life shall cease,
I shall possess, within the veil,
A life of joy and peace.

The earth shall soon dissolve like snow,
The sun forbear to shine;
But God, who called me here below,
Will be forever mine.`
  },
  {
    id: '2',
    slug: 'it-is-well-with-my-soul',
    title: 'It Is Well With My Soul',
    artist: 'Horatio Spafford',
    lyrics: `When peace like a river, attendeth my way,
When sorrows like sea billows roll
Whatever my lot, thou hast taught me to say
It is well, it is well, with my soul

It is well
With my soul
It is well, it is well with my soul

Though Satan should buffet, though trials should come,
Let this blest assurance control,
That Christ has regarded my helpless estate,
And hath shed His own blood for my soul

My sin, oh, the bliss of this glorious thought
My sin, not in part but the whole,
Is nailed to the cross, and I bear it no more,
Praise the Lord, praise the Lord, O my soul

And Lord, haste the day when my faith shall be sight,
The clouds be rolled back as a scroll;
The trump shall resound, and the Lord shall descend,
Even so, it is well with my soul`
  },
  {
    id: '3',
    slug: 'great-is-thy-faithfulness',
    title: 'Great Is Thy Faithfulness',
    artist: 'Thomas Chisholm',
    lyrics: `Great is Thy faithfulness, O God my Father,
There is no shadow of turning with Thee;
Thou changest not, Thy compassions, they fail not
As Thou hast been Thou forever wilt be.

Great is Thy faithfulness!
Great is Thy faithfulness!
Morning by morning new mercies I see;
All I have needed Thy hand hath provided
Great is Thy faithfulness, Lord, unto me!

Summer and winter, and springtime and harvest,
Sun, moon and stars in their courses above,
Join with all nature in manifold witness
To Thy great faithfulness, mercy and love.

Pardon for sin and a peace that endureth,
Thine own dear presence to cheer and to guide;
Strength for today and bright hope for tomorrow,
Blessings all mine, with ten thousand beside!`
  },
  {
    id: '4' ,
    slug: 'how-great-thou-art' ,
    title: 'How Great Thou Art' ,
    artist: 'Carl Boberg' ,
    lyrics: `O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made,
I see the stars, I hear the rolling thunder,
Thy power throughout the universe displayed.

Then sings my soul, my Savior God, to Thee,
How great Thou art, how great Thou art!
Then sings my soul, my Savior God, to Thee,
How great Thou art, how great Thou art!

When through the woods and forest glades I wander
And hear the birds sing sweetly in the trees,
When I look down from lofty mountain grandeur
And hear the brook and feel the gentle breeze.

And when I think that God, His Son not sparing,
Sent Him to die, I scarce can take it in,
That on the cross, my burden gladly bearing,
He bled and died to take away my sin.

When Christ shall come with shout of acclamation
And take me home, what joy shall fill my heart!
Then I shall bow in humble adoration
And there proclaim, my God, how great Thou art!`
  },
    {
    id: '5',
    slug: 'blessed-assurance',
    title: 'Blessed Assurance',
    artist: 'Fanny Crosby',
    lyrics: `Blessed assurance, Jesus is mine!
O what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed in His blood.

This is my story, this is my song,
Praising my Savior all the day long;
This is my story, this is my song,
Praising my Savior all the day long.

Perfect submission, perfect delight,
Visions of rapture now burst on my sight;
Angels descending bring from above
Echoes of mercy, whispers of love.

Perfect submission, all is at rest,
I in my Savior am happy and blest;
Watching and waiting, looking above,
Filled with His goodness, lost in His love.`
  }
];

export async function getSongs(): Promise<Song[]> {
  // In a real app, this would be a database call.
  return Promise.resolve(songs);
}

export async function getSongBySlug(slug: string): Promise<Song | undefined> {
  // In a real app, this would be a database call.
  return Promise.resolve(songs.find(song => song.slug === slug));
}

export async function findSongsByTitle(titles: string[]): Promise<Song[]> {
  const lowercasedTitles = titles.map(t => t.toLowerCase());
  return Promise.resolve(
    songs.filter(song => lowercasedTitles.includes(song.title.toLowerCase()))
  );
}
