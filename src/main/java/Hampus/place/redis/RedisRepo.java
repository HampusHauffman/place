package Hampus.place.redis;

import Hampus.place.Pixel;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;

@Repository
public class RedisRepo {

  public static final String KEY = "place";
  public static int IMAGE_SIZE = 50;

  private Jedis jedis = new Jedis("localhost");

  public void setPixel(Pixel p){
  int pp = ((p.getX()+p.getY()*IMAGE_SIZE)*4);
    jedis.bitfield(KEY,"SET", "u4", String.valueOf(pp), String.valueOf(p.getColor()));
  }

  public Pixel getPixel(int x, int y){
    //To start redis: redis-server /usr/local/etc/redis.conf
    int pp = (x+y*IMAGE_SIZE)*4;
    List<Long> l = jedis.bitfield(KEY,
        "GET", "u4", String.valueOf(pp));
    return Pixel.builder().color(l.get(0).intValue()).x(x).y(y).build();
  }




}
